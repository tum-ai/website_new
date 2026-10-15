import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  type ELabApplicationWindow,
  eLabPhaseCopyOf,
  eLabWindowClock,
} from "@/config/e-lab";
import { ELabApplicationCta, ELabApplicationStatus } from "./application-cta";

const eLabWindow: ELabApplicationWindow = {
  applicationsOpen: true,
  applicationUrl: "https://example.org/apply",
  applicationDeadlineDate: "12.11.2030",
  applicationDeadlineTime: "17:00",
  nextApplicationWindow: "Example round",
};
vi.mock("@/config/site-settings-content", () => ({
  getSiteFacts: async () => ({ eLab: { currentIteration: "Example" } }),
}));

vi.mock("@/config/schedule-content", () => ({
  getELabWindow: async () => eLabWindow,
}));

const deadline = eLabWindowClock(eLabWindow).closesAt ?? 0;
const copy = eLabPhaseCopyOf("Example", eLabWindow);

/** Both server components, resolved, as the page renders them side by side. */
async function renderCta() {
  const [cta, status] = await Promise.all([
    ELabApplicationCta({}),
    ELabApplicationStatus({}),
  ]);
  return render(
    <>
      {cta}
      {status}
    </>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("ELabApplicationCta", () => {
  test("while open, the link's accessible name contains its visible label", async () => {
    vi.useFakeTimers({ now: deadline - 60_000, toFake: ["Date"] });
    const { container } = await renderCta();
    const visible = copy.open.ctaLabel;
    // WCAG 2.5.3: the name contains the visible label, then the new-tab hint.
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName(expect.stringContaining(visible));
    expect(link).toHaveAccessibleName(
      expect.stringContaining("opens in a new tab"),
    );
    expect(link).toHaveAttribute("href", eLabWindow.applicationUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/until/)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("once closed, shows a status instead of a dead link", async () => {
    vi.useFakeTimers({ now: deadline, toFake: ["Date"] });
    const { container } = await renderCta();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(copy.closed.ctaLabel)).toBeInTheDocument();
    expect(screen.queryByText(/until/)).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
