import { axe } from "@test/axe";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Campaign } from "@/config/campaigns";
import { eLabApplicationCopy } from "@/config/e-lab";
import { type MembershipConfig, membershipConfig } from "@/config/membership";
import {
  getHeaderOptions,
  type HeaderCtaSchedule,
  headerConnectLinks,
  headerCtaSchedule,
  headerCtaSetting,
  mainNavigation,
} from "@/config/navigation";
import { Header } from "./header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/events") }));

/** A fixed, switched-on round, so the tests don't move with the live config. */
const membership: MembershipConfig = {
  ...membershipConfig,
  applicationsOpen: true,
  round: {
    ...membershipConfig.round,
    opens: "28.09.2026",
    deadlineDate: "27.10.2026",
    deadlineTime: "23:59",
  },
};

const scheduleWith = (campaigns: readonly Campaign[] = []) =>
  headerCtaSchedule({
    membership,
    fallback: headerCtaSetting.fallback,
    eLabCohortName: eLabApplicationCopy.cohortName,
    campaigns,
  });

function renderHeader(
  pathname: string,
  {
    membershipOpen = true,
    liveClock = false,
    schedule = scheduleWith(),
  }: {
    membershipOpen?: boolean;
    liveClock?: boolean;
    schedule?: HeaderCtaSchedule;
  } = {},
) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  // The site-wide CTA the server rendered for this membership state.
  const initialCta = getHeaderOptions("/", { membershipOpen }).cta;
  // The packaged dialog makes the website root inert while its menu is open.
  const view = () => (
    <div id="app-root">
      <Header
        ctaSchedule={schedule}
        initialCta={initialCta}
        connectLinks={headerConnectLinks}
        liveClock={liveClock}
      />
    </div>
  );
  const result = render(view());
  return {
    ...result,
    rerenderAt(nextPathname: string) {
      vi.mocked(usePathname).mockReturnValue(nextPathname);
      result.rerender(view());
    },
  };
}

beforeEach(() => {
  window.scrollY = 0;
});

afterEach(() => {
  window.scrollY = 0;
});

describe("header CTA", () => {
  test("server HTML preserves the supplied CTA before the live clock mounts", () => {
    const schedule = scheduleWith();
    const initialCta = getHeaderOptions("/", { membershipOpen: true }).cta;
    if (!initialCta) throw new Error("expected a server CTA");
    vi.mocked(usePathname).mockReturnValue("/events");
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime((schedule.membership.closesAt ?? 0) + 60_000);
      const markup = renderToString(
        <Header
          ctaSchedule={schedule}
          initialCta={initialCta}
          connectLinks={headerConnectLinks}
        />,
      );
      const serverPage = document.createElement("div");
      serverPage.innerHTML = markup;
      expect(
        within(serverPage).getByRole("link", { name: initialCta.label }),
      ).toHaveAttribute("href", initialCta.href);
    } finally {
      vi.useRealTimers();
    }
  });

  test("a fixed render clock keeps the supplied CTA after the browser deadline", () => {
    const schedule = scheduleWith();
    const initialCta = getHeaderOptions("/", { membershipOpen: true }).cta;
    if (!initialCta) throw new Error("expected a server CTA");
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime((schedule.membership.closesAt ?? 0) + 60_000);
      renderHeader("/events", { schedule, liveClock: false });
      expect(
        within(screen.getByRole("banner")).getByRole("link", {
          name: initialCta.label,
        }),
      ).toHaveAttribute("href", initialCta.href);
    } finally {
      vi.useRealTimers();
    }
  });

  test.each([
    ["/events", true],
    ["/events", false],
    ["/", true],
    ["/partners", false],
  ] as const)(
    "shows the configured call to action on %s (membership open: %s)",
    (pathname, membershipOpen) => {
      renderHeader(pathname, { membershipOpen });
      const banner = within(screen.getByRole("banner"));
      const { cta } = getHeaderOptions(pathname, { membershipOpen });
      if (!cta) {
        // Only the logo and the main links.
        expect(banner.getAllByRole("link", { hidden: true })).toHaveLength(
          mainNavigation.length + 1,
        );
        return;
      }
      expect(banner.getByRole("link", { name: cta.label })).toHaveAttribute(
        "href",
        cta.href,
      );
    },
  );

  test("switches to the closed-round CTA once the deadline passes", () => {
    const closesAt = scheduleWith().membership.closesAt ?? 0;
    const open = getHeaderOptions("/events", { membershipOpen: true }).cta;
    const closed = getHeaderOptions("/events", { membershipOpen: false }).cta;
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(closesAt + 60_000);
      // A cached render from before the deadline: corrected after mount.
      renderHeader("/events", { membershipOpen: true, liveClock: true });
      const banner = within(screen.getByRole("banner"));
      if (!closed) throw new Error("the closed-round CTA has no target");
      expect(banner.getByRole("link", { name: closed.label })).toHaveAttribute(
        "href",
        closed.href,
      );
      if (open && open.label !== closed.label) {
        expect(
          banner.queryByRole("link", { name: open.label }),
        ).not.toBeInTheDocument();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  test("a campaign starts on time on a cached page and ends by itself", () => {
    const campaign: Campaign = {
      id: "campaign-elab",
      name: "E-Lab kickoff",
      startDate: "01.12.2026",
      startTime: "10:00",
      endDate: "01.12.2026",
      endTime: "10:01",
      headerCta: { variant: "elab", yieldsToRecruiting: false },
    };
    const schedule = scheduleWith([campaign]);
    const startsAt = schedule.campaigns[0].startsAt ?? 0;
    const elab = schedule.ctas.elab;
    const closed = getHeaderOptions("/events", { membershipOpen: false }).cta;
    if (!closed || !elab.href) throw new Error("expected linked CTAs");
    vi.useFakeTimers();
    try {
      vi.setSystemTime(startsAt - 1000);
      renderHeader("/events", {
        membershipOpen: false,
        liveClock: true,
        schedule,
      });
      const banner = within(screen.getByRole("banner"));
      expect(banner.getByRole("link", { name: closed.label })).toBeVisible();

      act(() => vi.advanceTimersByTime(1500));
      expect(banner.getByRole("link", { name: elab.label })).toHaveAttribute(
        "href",
        elab.href,
      );

      act(() => vi.advanceTimersByTime(60_000));
      expect(banner.getByRole("link", { name: closed.label })).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("logo", () => {
  test("shows on routes that don't hide it", () => {
    renderHeader("/events");
    expect(screen.getByRole("link", { name: "TUM.ai home" })).toBeVisible();
  });

  test("home shows it from the start: the hero has no logo of its own", () => {
    renderHeader("/");
    expect(screen.getByRole("link", { name: "TUM.ai home" })).toBeVisible();
  });
});

describe("mobile menu", () => {
  test("route navigation closes the menu and applies the new route CTA", async () => {
    const user = userEvent.setup();
    const { rerenderAt } = renderHeader("/events");
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await screen.findByRole("dialog", { name: "Menu" });

    rerenderAt("/partners");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.getElementById("app-root")?.inert).toBe(false);
    const { cta } = getHeaderOptions("/partners", { membershipOpen: true });
    if (!cta) throw new Error("expected the partner route CTA");
    expect(
      within(screen.getByRole("banner")).getByRole("link", { name: cta.label }),
    ).toHaveAttribute("href", cta.href);

    rerenderAt("/events");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("opens as a modal dialog with the main links and closes on Escape", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderHeader("/events");
    const trigger = screen.getByRole("button", { name: "Open menu" });

    await user.click(trigger);
    const menu = await screen.findByRole("dialog", { name: "Menu" });
    expect(document.getElementById("app-root")?.inert).toBe(true);
    expect(
      within(menu).getByRole("button", { name: "Close menu" }),
    ).toHaveFocus();

    const nav = within(menu).getByRole("navigation", { name: "Main" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toStrictEqual(mainNavigation.map((link) => link.label));
    expect(within(nav).getByRole("link", { name: "Events" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await axe(baseElement)).toHaveNoViolations();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.getElementById("app-root")?.inert).toBe(false);
  });

  test("closes when a link is chosen", async () => {
    const user = userEvent.setup();
    renderHeader("/events");
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = await screen.findByRole("dialog", { name: "Menu" });

    await user.click(within(menu).getByRole("link", { name: "Research" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.getElementById("app-root")?.inert).toBe(false);
  });

  test("external connect links announce the new tab", async () => {
    const user = userEvent.setup();
    renderHeader("/events");
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = await screen.findByRole("dialog", { name: "Menu" });

    for (const { label, href } of headerConnectLinks) {
      const external = href.startsWith("https://");
      // jsdom drops the space before the hint that browsers keep.
      const link = within(menu).getByRole("link", {
        name: external ? `${label}(opens in a new tab)` : label,
      });
      expect(link).toHaveAttribute("href", href);
      expect(link.getAttribute("target")).toBe(external ? "_blank" : null);
    }
  });
});
