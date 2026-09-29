import { axe } from "@test/axe";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { MembershipConfig } from "@/config/membership";
import { ApplyAction, LiveApplyAction } from "./apply-action";
import { recruitingCall } from "./round";

const form = "https://example.com/form";

describe("ApplyAction", () => {
  test("links to the application form while the call is open", async () => {
    const { container } = render(
      <ApplyAction
        phase="open"
        href={form}
        statusId="status"
        closedLabel="unused"
      />,
    );
    expect(screen.getByRole("link", { name: /Apply now/ })).toHaveAttribute(
      "href",
      form,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  test.each([
    ["upcoming", "Opens 28 September"],
    ["closed", "Applications closed"],
  ] as const)(
    "while %s, the button stays focusable and says why it is unavailable",
    async (phase, label) => {
      const { container } = render(
        <ApplyAction
          phase={phase}
          href={form}
          statusId="status"
          closedLabel={label}
        />,
      );
      const button = screen.getByRole("button", { name: "Apply now" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveAccessibleDescription(label);
      expect(screen.queryByRole("link")).toBeNull();
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});

describe("LiveApplyAction", () => {
  /** An injected round, so the test doesn't move with the config or the CMS. */
  const config: MembershipConfig = {
    applicationsOpen: true,
    applicationUrl: form,
    round: {
      name: "Test round",
      opens: "28.09.2026",
      deadlineDate: "27.10.2026",
      deadlineTime: "23:59",
      interviews: { from: "02.11.2026", to: "08.11.2026" },
      onboarding: { from: "14.11.2026", to: "16.11.2026" },
    },
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Renders the call of `renderedAt`, then moves the browser clock to `now`. */
  function renderAt(renderedAt: string, now: string) {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(renderedAt));
    const call = recruitingCall(new Date(renderedAt), config);
    render(<LiveApplyAction call={call} statusId="status" />);
    vi.setSystemTime(new Date(now));
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
  }

  test("an open call's form link turns inert at the deadline", () => {
    renderAt("2026-10-27T21:00:00Z", "2026-10-27T22:59:00Z");
    const button = screen.getByRole("button", { name: "Apply now" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAccessibleDescription("Applications closed");
  });

  test("an upcoming call's button becomes the form link when the form opens", () => {
    renderAt("2026-09-27T12:00:00Z", "2026-09-27T22:00:00Z");
    expect(screen.getByRole("link", { name: /Apply now/ })).toHaveAttribute(
      "href",
      form,
    );
  });
});
