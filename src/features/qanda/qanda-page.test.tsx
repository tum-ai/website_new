import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { contactEmails } from "@/config/contact";
import { brandMission } from "@/config/organization";
import { faqs, missionQuestion } from "./data/qanda";
import { QandAPage, qandaMainEntity } from "./qanda-page";

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
  window.history.replaceState(null, "", "/");
});

const passage = () => {
  const node = document.getElementById("mission-passage");
  if (!node) throw new Error("expected the mission passage");
  return node;
};

/** The phrases of the passage that answer the question with `id`. */
const marksOf = (id: string) => [
  ...passage().querySelectorAll<HTMLElement>(`[data-answers="${id}"]`),
];

const trigger = (question: string) =>
  screen.getByRole("button", { name: question });

describe("QandAPage", () => {
  test("opens on the brand mission and asks the mission question below", () => {
    render(<QandAPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(brandMission)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: missionQuestion }),
    ).toBeInTheDocument();
  });

  test("lists every question, the first open", () => {
    render(<QandAPage />);
    const triggers = faqs.map((faq) => trigger(faq.question));
    const [first, ...rest] = triggers;
    expect(first).toHaveAttribute("aria-expanded", "true");
    for (const other of rest) {
      expect(other).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("keeps each answer's words in the passage, in the passage's words", () => {
    render(<QandAPage />);
    for (const faq of faqs) {
      expect(marksOf(faq.id).map((mark) => mark.textContent)).toEqual([
        ...(faq.spans ?? []),
      ]);
    }
  });

  test("marks only the open question's words and follows the open question", async () => {
    const user = userEvent.setup();
    render(<QandAPage />);
    const [first, second] = faqs;
    for (const mark of marksOf(first.id)) {
      expect(mark).toHaveAttribute("data-active");
    }

    await user.click(trigger(second.question));
    for (const mark of marksOf(second.id)) {
      expect(mark).toHaveAttribute("data-active");
    }
    for (const mark of marksOf(first.id)) {
      expect(mark).not.toHaveAttribute("data-active");
    }
  });

  test("points to the questions the passage doesn't answer", async () => {
    const user = userEvent.setup();
    render(<QandAPage />);
    const unmarked = faqs.filter((faq) => !faq.spans?.length);
    expect(unmarked.length).toBeGreaterThan(0);
    for (const faq of unmarked) {
      const link = screen.getByRole("link", { name: faq.question });
      await user.click(link);
      expect(trigger(faq.question)).toHaveAttribute("aria-expanded", "true");
    }
  });

  test("shows each answer's fact and where to see it", async () => {
    const user = userEvent.setup();
    render(<QandAPage />);
    const withFact = faqs.find((faq) => faq.evidence?.text);
    if (!withFact?.evidence?.text) throw new Error("expected a fact");
    const button = trigger(withFact.question);
    if (button.getAttribute("aria-expanded") === "false") {
      await user.click(button);
    }
    expect(screen.getByText(withFact.evidence.text)).toBeVisible();
    expect(
      screen.getByRole("link", { name: withFact.evidence.label }),
    ).toHaveAttribute("href", withFact.evidence.href);
  });

  test("closes with the inbox and both readers' next steps", () => {
    render(<QandAPage />);
    const close = screen.getByRole("region", {
      name: "Not in the paragraph? Ask us.",
    });
    expect(
      within(close).getByRole("link", { name: "Ask your question" }),
    ).toHaveAttribute(
      "href",
      expect.stringMatching(new RegExp(`^mailto:${contactEmails.general}\\?`)),
    );
    expect(
      within(close).getByRole("link", { name: "Become a Member" }),
    ).toHaveAttribute("href", "/apply");
    expect(
      within(close).getByRole("link", { name: "Become a Partner" }),
    ).toHaveAttribute("href", "/partners");
  });

  test("describes every question and the mission in the FAQPage entities", () => {
    expect(qandaMainEntity.map((entity) => entity.name)).toEqual([
      missionQuestion,
      ...faqs.map((faq) => faq.question),
    ]);
    for (const entity of qandaMainEntity) {
      expect(entity.acceptedAnswer.text.length).toBeGreaterThan(0);
    }
  });

  test("has no axe violations with an answer open", async () => {
    const { container } = render(<QandAPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
