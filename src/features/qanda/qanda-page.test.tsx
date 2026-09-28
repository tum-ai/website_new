import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { faqs } from "./data/qanda";
import { QandAPage } from "./qanda-page";

const MISSION_QUESTION = "What is TUM.ai's Mission?";

/*
 * Reduced motion keeps every Reveal in its idle, visible state, so jsdom
 * needs no IntersectionObserver.
 */
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function faqRegion() {
  return screen.getByRole("region", { name: "Questions & answers" });
}

describe("QandAPage", () => {
  test("sets the mission apart and lists every other question in the FAQ, the first open", () => {
    render(<QandAPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: MISSION_QUESTION }),
    ).toBeInTheDocument();

    const triggers = within(faqRegion()).getAllByRole("button");
    expect(triggers.map((trigger) => trigger.textContent)).toEqual(
      faqs
        .map((faq) => faq.question)
        .filter((question) => question !== MISSION_QUESTION),
    );
    const [first, ...rest] = triggers;
    expect(first).toHaveAttribute("aria-expanded", "true");
    for (const trigger of rest) {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("numbers the mission and the FAQ in their eyebrows", () => {
    render(<QandAPage />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(within(faqRegion()).getByText("02")).toBeInTheDocument();
  });

  test("opens and closes an answer with the keyboard", async () => {
    const user = userEvent.setup();
    render(<QandAPage />);
    const [first, second] = within(faqRegion()).getAllByRole("button");

    first.focus();
    await user.tab();
    expect(second).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(second).toHaveAttribute("aria-expanded", "false");
  });

  test("renders a multi-line answer as an intro and a list", async () => {
    const user = userEvent.setup();
    render(<QandAPage />);
    const multiLine = faqs.find((faq) => faq.answer.includes("\n"));
    if (!multiLine) throw new Error("expected a multi-line FAQ answer");
    const [intro, ...items] = multiLine.answer
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const trigger = within(faqRegion()).getByRole("button", {
      name: multiLine.question,
    });
    if (trigger.getAttribute("aria-expanded") === "false") {
      await user.click(trigger);
    }
    const panel = screen.getByText(intro).parentElement;
    if (!panel) throw new Error("expected the answer's content box");
    expect(
      within(panel)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(items);
  });

  test("has no axe violations with an answer open", async () => {
    const { container } = render(<QandAPage />);
    expect(within(faqRegion()).getAllByRole("button")[0]).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
