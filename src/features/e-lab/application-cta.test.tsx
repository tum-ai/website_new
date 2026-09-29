import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  eLabApplicationsCloseAt,
  eLabConfig,
  eLabPhaseCopy,
} from "@/config/e-lab";
import { ELabApplicationCta, ELabApplicationStatus } from "./application-cta";

vi.mock("@/config/e-lab", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/config/e-lab")>();
  return {
    ...actual,
    isELabApplicationOpen: (now: Date) =>
      actual.isApplicationWindowOpen({
        switchedOn: true,
        closesAt: actual.eLabApplicationsCloseAt,
        now,
      }),
  };
});

const deadline = eLabApplicationsCloseAt.getTime();

afterEach(() => {
  vi.useRealTimers();
});

describe("ELabApplicationCta", () => {
  test("while open, the link's accessible name contains its visible label", async () => {
    vi.useFakeTimers({ now: deadline - 60_000, toFake: ["Date"] });
    const { container } = render(
      <>
        <ELabApplicationCta />
        <ELabApplicationStatus />
      </>,
    );
    const visible = eLabPhaseCopy.open.ctaLabel;
    // WCAG 2.5.3: the name contains the visible label, then the new-tab hint.
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName(expect.stringContaining(visible));
    expect(link).toHaveAccessibleName(
      expect.stringContaining("opens in a new tab"),
    );
    expect(link).toHaveAttribute("href", eLabConfig.applicationUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/until/)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("once closed, shows a status instead of a dead link", async () => {
    vi.useFakeTimers({ now: deadline, toFake: ["Date"] });
    const { container } = render(
      <>
        <ELabApplicationCta />
        <ELabApplicationStatus />
      </>,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(eLabPhaseCopy.closed.ctaLabel)).toBeInTheDocument();
    expect(screen.queryByText(/until/)).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
