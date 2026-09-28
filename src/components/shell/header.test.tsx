import { axe } from "@test/axe";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  getHeaderOptions,
  headerConnectLinks,
  mainNavigation,
} from "@/config/navigation";
import { Header } from "./header";
import { logoRevealShare } from "./header-scroll";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/events") }));

function renderHeader(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(pathname);
  // The ds Dialog makes `#app-root` inert while the menu is open.
  return render(
    <div id="app-root">
      <Header />
    </div>,
  );
}

async function scrollTo(y: number) {
  await act(async () => {
    window.scrollY = y;
    window.dispatchEvent(new Event("scroll"));
    // The header measures once per animation frame.
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

beforeEach(() => {
  window.scrollY = 0;
});

afterEach(() => {
  window.scrollY = 0;
});

describe("header CTA", () => {
  test.each(["/events", "/", "/partners"])(
    "shows the configured call to action on %s",
    (pathname) => {
      renderHeader(pathname);
      const banner = within(screen.getByRole("banner"));
      const { cta } = getHeaderOptions(pathname);
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
});

describe("logo", () => {
  test("shows on routes that don't hide it", () => {
    renderHeader("/events");
    expect(screen.getByRole("link", { name: "TUM.ai home" })).toBeVisible();
  });

  test("home hides it over the hero and reveals it after scrolling", async () => {
    const { container } = renderHeader("/");
    const logo = () => container.querySelector('a[aria-label="TUM.ai home"]');
    expect(logo()).toHaveAttribute("aria-hidden", "true");
    expect(logo()).toHaveAttribute("tabindex", "-1");

    await scrollTo(window.innerHeight * logoRevealShare.wide + 1);
    expect(logo()).not.toHaveAttribute("aria-hidden");
    expect(logo()).not.toHaveAttribute("tabindex");
  });
});

describe("mobile menu", () => {
  test("opens as a modal dialog with the main links and closes on Escape", async () => {
    const user = userEvent.setup();
    const { baseElement } = renderHeader("/events");
    const trigger = screen.getByRole("button", { name: "Open menu" });

    await user.click(trigger);
    const menu = await screen.findByRole("dialog", { name: "Menu" });
    expect(document.getElementById("app-root")?.inert).toBe(true);

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
