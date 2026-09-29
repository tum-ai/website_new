"use client";

import { ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type FocusEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BrandMark,
  ButtonLink,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ds";
import {
  isMembershipApplicationOpen,
  membershipWindowBoundaries,
} from "@/config/membership";
import {
  getHeaderOptions,
  headerConnectLinks,
  mainNavigation,
} from "@/config/navigation";
import { cn } from "@/lib/cn";
import { useClockSwitch } from "@/lib/use-clock-switch";
import { getHeaderScrollState } from "./header-scroll";
import { NavAnchor } from "./nav-anchor";

const logo = {
  src: "/assets/tum_ai_logo_new.svg",
  width: 1640,
  height: 406,
} as const;

/** Props for {@link Header}, computed by the site layout on the server. */
export type HeaderProps = {
  /**
   * Whether membership applications are open at render time
   * (`isMembershipApplicationOpen(getCmsNow())`); must match the server HTML.
   */
  initialMembershipOpen: boolean;
  /** `false` on a fixed render clock (`MOCK_CMS_NOW`); see `useClockSwitch`. */
  liveClock?: boolean;
};

/**
 * Site header: a floating pill, always visible. What it shows on a route
 * (frosted from the start, the CTA) comes from `getHeaderOptions` in
 * `@/config/navigation`; how it reacts to scrolling from `header-scroll.ts`.
 *
 * - Transparent over the dark page hero; frosted once the page scrolls.
 * - The fixed element starts 12px below the top edge on purpose: Safari 26
 *   tints its status bar from fixed elements touching the top, and we want
 *   the page itself to show through there once it scrolls.
 * - Below xl the navigation opens as the ds full-screen Dialog (focus trap,
 *   scroll lock, Escape, focus return, inert page; deliberately no swipe
 *   gesture). Its flat ink panel covers the whole large viewport, so
 *   Safari's top and bottom bars both tint to the same color and nothing of
 *   the page shows below it.
 * - The pill's bottom stays above `--header-offset` (`scroll-mt-header`), so
 *   in-page anchors land below it.
 *
 * Safari workarounds: docs/browser-quirks.md.
 */
export const Header = ({
  initialMembershipOpen,
  liveClock = true,
}: HeaderProps) => {
  const pathname = usePathname();
  // The CTA follows the dated membership window: the layout renders it by
  // the server's clock, and the browser flips it when the form opens and at
  // the deadline.
  const membershipOpen = useClockSwitch({
    isOn: isMembershipApplicationOpen,
    boundaries: membershipWindowBoundaries,
    initial: initialMembershipOpen,
    live: liveClock,
  });
  const { solid, cta } = getHeaderOptions(pathname, { membershipOpen });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      // React skips the re-render when the value is unchanged.
      setScrolled(getHeaderScrollState({ scrollY: window.scrollY }).scrolled);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname isn't read in the body, but is the intended re-run trigger on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Hover/focus pill that glides between desktop nav items. */
  const movePill = useCallback(
    (
      event: PointerEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>,
    ) => {
      const nav = navRef.current;
      if (!nav) return;
      const target = event.currentTarget;
      nav.style.setProperty("--pill-x", `${target.offsetLeft}px`);
      nav.style.setProperty("--pill-w", `${target.offsetWidth}px`);
      nav.style.setProperty("--pill-o", "1");
    },
    [],
  );
  const hidePill = useCallback(() => {
    navRef.current?.style.setProperty("--pill-o", "0");
  }, []);

  const frosted = solid || scrolled || open;
  // An in-page anchor scrolls this page: it keeps its place on phones and
  // needs no arrow.
  const ctaInPage = cta?.href.startsWith("#") ?? false;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <header className="pointer-events-none fixed inset-x-0 top-2.5 z-40 md:top-3">
        <div className="mx-auto w-[min(82rem,calc(100%-1.25rem))] md:w-[min(82rem,calc(100%-2*var(--gutter)+2rem))]">
          <div
            className={cn(
              "pointer-events-auto relative flex h-14 items-center gap-2 rounded-full border pr-2 pl-4 text-white transition-[background-color,border-color,box-shadow] duration-500 ease-brand md:pl-5",
              frosted
                ? "border-white/10 bg-ink-950/75 shadow-[0_16px_40px_-18px_var(--color-ink-950)] shadow-ink-950/80 backdrop-blur-xl backdrop-saturate-150"
                : "border-transparent bg-transparent",
            )}
          >
            <Link
              href="/"
              aria-label="TUM.ai home"
              className="flex shrink-0 items-center rounded-full"
            >
              {/* One of the homepage's two image preloads, with the hero
                  aperture's first photo (test/perf/homepage.perf.ts). */}
              <Image {...logo} alt="" preload className="h-6 w-auto md:h-7" />
            </Link>

            <nav
              ref={navRef}
              aria-label="Main"
              onPointerLeave={hidePill}
              className="relative mx-auto hidden items-center xl:flex"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-0 h-9 w-(--pill-w) translate-x-(--pill-x) -translate-y-1/2 rounded-full bg-white/[0.09] opacity-[var(--pill-o,0)] transition-[translate,width,opacity] duration-300 ease-brand motion-reduce:transition-none"
              />
              {mainNavigation.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onPointerEnter={movePill}
                    onFocus={movePill}
                    onBlur={hidePill}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 font-semibold text-small/normal transition-colors duration-300",
                      active
                        ? "text-white"
                        : "text-minimal-gray hover:text-white",
                    )}
                  >
                    {label}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-indicator"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2 xl:ml-0">
              {cta ? (
                <ButtonLink
                  href={cta.href}
                  size="sm"
                  arrow={ctaInPage ? undefined : true}
                  className={cn("h-10", !ctaInPage && "hidden sm:inline-flex")}
                >
                  {cta.label}
                </ButtonLink>
              ) : null}
              <DialogTrigger
                aria-label="Open menu"
                className="group/menu grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 xl:hidden"
              >
                <span aria-hidden className="flex w-4 flex-col gap-1.25">
                  <span className="h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-brand group-hover/menu:translate-x-0.5" />
                  <span className="h-[1.5px] w-2/3 rounded-full bg-current transition-[width] duration-300 ease-brand group-hover/menu:w-full" />
                </span>
              </DialogTrigger>
            </div>
          </div>
        </div>
      </header>

      <DialogContent
        variant="fullscreen"
        tone="ink"
        className="group/menu-panel max-w-md"
      >
        <BrandMark
          drift={false}
          intensity="subtle"
          className="absolute right-[-18%] bottom-[18%] -z-10 w-[85%]"
        />
        {/*
         * The panel extends under Safari's toolbars; its content fills the
         * visible viewport. min-h-lvh + bottom padding of (lvh - dvh): when
         * the menu overflows (small phones, landscape), its last row can
         * still scroll above Safari's toolbar. See docs/browser-quirks.md.
         */}
        <div className="flex min-h-lvh flex-col pb-[calc(100lvh-100dvh)]">
          {/* Lines the close button up with the menu button it replaces. */}
          <div className="flex h-(--header-height) items-center justify-between pt-2 pr-4.75 pl-6.75 md:pt-3 md:pr-[calc(var(--gutter)-0.4375rem)] md:pl-8">
            <Image
              {...logo}
              alt=""
              loading="lazy"
              className="h-6 w-auto md:h-7"
            />
            <DialogClose
              aria-label="Close menu"
              className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-[background-color,rotate] duration-300 ease-brand hover:bg-white/20 motion-safe:hover:rotate-90"
            >
              <X aria-hidden className="size-4" />
            </DialogClose>
          </div>
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <nav aria-label="Main" className="flex-1 px-6 pt-8">
            <ul>
              {mainNavigation.map(({ href, label }, index) => {
                const active = isActive(href);
                return (
                  <li
                    key={href}
                    style={{ transitionDelay: `${90 + index * 45}ms` }}
                    className="transition-[opacity,translate] duration-700 ease-brand group-data-[starting-style]/menu-panel:translate-x-8 group-data-[starting-style]/menu-panel:opacity-0 motion-reduce:transition-none"
                  >
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="group/item flex items-center justify-between border-hairline border-b py-4 text-fg text-heading-lg transition-colors duration-300 hover:text-highlight"
                    >
                      <span className="flex items-center gap-3">
                        {label}
                        {active ? (
                          <span
                            aria-hidden
                            className="size-1.5 rounded-full bg-indicator"
                          />
                        ) : null}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-5 -translate-x-1 opacity-0 transition-[opacity,translate] duration-300 ease-brand group-hover/item:translate-x-0 group-hover/item:opacity-100 motion-reduce:transition-none"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="px-6 pt-10 pb-8">
            {cta ? (
              <ButtonLink
                href={cta.href}
                size="lg"
                arrow
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {cta.label}
              </ButtonLink>
            ) : null}
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-fg-muted text-small">
              {headerConnectLinks.map((link) => (
                <li key={link.href}>
                  <NavAnchor
                    {...link}
                    className="transition-colors duration-300 hover:text-fg"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
