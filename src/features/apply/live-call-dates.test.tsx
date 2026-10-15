import { axe } from "@test/axe";
import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MembershipConfig } from "@/config/membership";
import { ClosingSection } from "./closing-section";

const heroCopy = {
  heroTitle: "A sample call",
  heroLead: "Read the dates.",
  faqLabel: "Questions",
  datesTitle: "Dates, {{round}}",
};
const closingCopy = { companiesReader: "For organizations" };

import { Hero } from "./hero";
import { LiveClosingRuler } from "./live-call-dates";
import { recruitingCall } from "./round";

/** An injected round, so the tests don't move with the config or the CMS. */
const config: MembershipConfig = {
  applicationsOpen: true,
  applicationUrl: "https://example.com/form",
  round: {
    name: "Test round",
    opens: "28.09.2026",
    deadlineDate: "27.10.2026",
    deadlineTime: "23:59",
    interviews: { from: "02.11.2026", to: "08.11.2026" },
    onboarding: { from: "14.11.2026", to: "16.11.2026" },
  },
};

beforeEach(() => {
  // Reduced motion: the closing band's reveals show at once.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** axe schedules with real timers. */
async function expectNoAxeViolations(container: HTMLElement) {
  vi.useRealTimers();
  expect(await axe(container)).toHaveNoViolations();
}

/** The call the server rendered at `renderedAt`, with the browser clock there too. */
function serverCall(renderedAt: string) {
  vi.setSystemTime(new Date(renderedAt));
  return recruitingCall(new Date(renderedAt), config);
}

/** Lets the browser clock run to `iso`, firing the timers due on the way. */
function runUntil(iso: string) {
  act(() => {
    vi.advanceTimersByTime(new Date(iso).getTime() - Date.now());
  });
}

/** Moves the browser clock to `iso` and returns to the tab. */
function returnAt(iso: string) {
  vi.setSystemTime(new Date(iso));
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

function renderHero(renderedAt: string) {
  return render(
    <Hero call={serverCall(renderedAt)} membership={config} copy={heroCopy} />,
  );
}

/** The register row for `label`: its term and its date. */
function row(label: string) {
  const term = screen.getByText(label).closest("dt");
  if (!term?.parentElement) throw new Error(`No register row "${label}"`);
  return within(term.parentElement);
}

/** The ruler's mark on today's tick (the ruler is decorative). */
const todayMark = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-today]");

describe("the hero's dates", () => {
  test("count down to the deadline day at Munich midnight, without a reload", async () => {
    vi.useFakeTimers();
    const { container } = renderHero("2026-10-26T12:00:00Z");
    expect(row("Application deadline").getByText("1 day left")).toBeVisible();
    const before = todayMark(container)?.style.left;

    // Midnight in Munich (winter time since 25 October) is 23:00Z.
    runUntil("2026-10-26T22:59:00Z");
    expect(row("Application deadline").getByText("1 day left")).toBeVisible();

    runUntil("2026-10-26T23:00:01Z");
    expect(row("Application deadline").getByText("Closes today")).toBeVisible();
    expect(todayMark(container)?.style.left).not.toBe(before);
    expect(todayMark(container)).toHaveStyle({ left: "100%" });
    await expectNoAxeViolations(container);
  });

  test("an upcoming call's dates read as open once the form opens", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const { container } = renderHero("2026-09-27T12:00:00Z");
    expect(screen.getByText("Opens 28 Sep")).toBeInTheDocument();
    expect(row("Applications open").getByText("Tomorrow")).toBeVisible();

    // The form opens at Munich midnight on 28 September (22:00Z).
    returnAt("2026-09-27T22:00:00Z");
    expect(screen.getByText("Opened 28 Sep")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(row("Applications open").getByText("28 Sep")).toHaveTextContent(
      "(passed)",
    );
    expect(row("Application deadline").getByText("29 days left")).toBeVisible();
    await expectNoAxeViolations(container);
  });
});

describe("the closing band", () => {
  function renderClosing(renderedAt: string) {
    return render(
      <ClosingSection
        call={serverCall(renderedAt)}
        membership={config}
        copy={closingCopy}
        partnerPitch="Meet our members."
      />,
    );
  }

  test("marks the deadline day once Munich midnight passes", async () => {
    vi.useFakeTimers();
    const { container } = renderClosing("2026-10-26T12:00:00Z");
    expect(screen.getByText("1 day left")).toBeInTheDocument();

    runUntil("2026-10-26T23:00:01Z");
    expect(screen.getByText("Closes today")).toBeInTheDocument();
    expect(screen.queryByText("1 day left")).toBeNull();
    await expectNoAxeViolations(container);
  });

  test("the paragraph under the title counts down with the ruler", () => {
    vi.useFakeTimers();
    renderClosing("2026-10-26T12:00:00Z");
    const lead = (label: string) =>
      screen.getByText(new RegExp(`^${label}\\. The form closes at 23:59`));
    expect(lead("1 day left")).toBeVisible();

    runUntil("2026-10-26T23:00:01Z");
    expect(lead("Closes today")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Applications close on 27 October.",
      }),
    ).toBeVisible();
  });

  test("an upcoming call's title and paragraph read as open once the form opens", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    renderClosing("2026-09-27T12:00:00Z");
    expect(
      screen.getByRole("heading", {
        name: "Applications open on 28 September.",
      }),
    ).toBeVisible();
    expect(screen.getByText(/^The form stays open until/)).toBeVisible();

    returnAt("2026-09-27T22:00:00Z");
    expect(
      screen.getByRole("heading", {
        name: "Applications close on 27 October.",
      }),
    ).toBeVisible();
    expect(screen.getByText(/^29 days left\. The form closes/)).toBeVisible();
  });

  test("an upcoming call's ruler says opened once the form opens", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    renderClosing("2026-09-27T12:00:00Z");
    expect(screen.getByText("Opens 28 Sep")).toBeInTheDocument();

    returnAt("2026-09-27T22:00:00Z");
    expect(screen.getByText("Opened 28 Sep")).toBeInTheDocument();
    expect(screen.getByText("29 days left")).toBeInTheDocument();
  });

  test("keeps the server's call on a fixed render clock", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const call = serverCall("2026-10-26T12:00:00Z");
    render(<LiveClosingRuler call={call} config={config} live={false} />);

    returnAt("2026-10-27T12:00:00Z");
    expect(screen.getByText("1 day left")).toBeInTheDocument();
  });
});
