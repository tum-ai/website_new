"use client";

import { Drawer } from "@base-ui/react/drawer";
import { ArrowUpRight, X } from "lucide-react";
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
import { Aurora } from "@/components/ds/aurora";
import { ButtonLink } from "@/components/ds/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/events", text: "Events" },
  { href: "/research", text: "Research" },
  { href: "/projects", text: "Projects" },
  { href: "/e-lab", text: "Entrepreneurship" },
  { href: "/community", text: "Community" },
  { href: "/partners", text: "Partners" },
  { href: "/qanda", text: "Q&A" },
];

const socialLinks = [
  { href: "https://de.linkedin.com/company/tum-ai", text: "LinkedIn" },
  { href: "https://www.instagram.com/tum.ai_official/", text: "Instagram" },
  { href: "mailto:contact@tum-ai.com", text: "Email" },
];

/**
 * Site header, always visible.
 *
 * - Transparent over the dark page hero; solid once the page scrolls.
 * - Phones: a full-width bar flush with the top edge. Its solid fill is the
 *   same dark indigo as the browser status bar (theme-color and root canvas in
 *   layout.tsx / index.css), so both read as one continuous top bar.
 * - md and up: a floating frosted pill.
 * - Home keeps the logo hidden until the hero (which shows it large) scrolls
 *   away. /partners keeps the bar solid and swaps the CTA for its in-page
 *   contact anchor.
 * - Below xl the navigation lives in a Base UI Drawer (focus trap, scroll
 *   lock, Escape and swipe-to-dismiss included).
 * - Bar bottom stays within 80px: /partners anchors use a 110px scroll margin.
 */
export const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPartners = pathname === "/partners";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogo, setShowLogo] = useState(!isHome);
  const scrolledRef = useRef(false);
  const showLogoRef = useRef(!isHome);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;

    const updateScrollState = () => {
      const isMobile = window.innerWidth < 768;
      const scrollY = Math.max(window.scrollY, 0);
      const threshold = isMobile
        ? window.innerHeight * 0.3
        : window.innerHeight * 0.6;
      const nextShowLogo = !isHome || scrollY > threshold;
      const nextScrolled = scrollY > 8;

      if (showLogoRef.current !== nextShowLogo) {
        showLogoRef.current = nextShowLogo;
        setShowLogo(nextShowLogo);
      }

      if (scrolledRef.current !== nextScrolled) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateScrollState();
      });
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isHome]);

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

  const solid = isPartners || scrolled || open;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const cta = isPartners
    ? { href: "#partner-contact", label: "Become a partner" }
    : { href: "/apply", label: "Become a Member" };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="right">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="mx-auto w-full md:w-[min(82rem,calc(100%-2*var(--gutter)+2rem))] md:pt-3">
          <div
            className={cn(
              "pointer-events-auto relative flex h-14 items-center gap-2 border-b pr-3 pl-5 text-white transition-[background-color,border-color,box-shadow] duration-500 ease-brand md:rounded-full md:border md:pr-2",
              solid
                ? "border-white/10 bg-[#1b0049] shadow-[0_12px_32px_-22px_rgb(13_2_20/0.9)] md:bg-[#0d0214]/75 md:shadow-[0_16px_40px_-18px_rgb(13_2_20/0.8)] md:backdrop-blur-xl md:backdrop-saturate-150"
                : "border-transparent bg-transparent",
            )}
          >
            <Link
              href="/"
              aria-label="TUM.ai home"
              tabIndex={showLogo || isPartners ? undefined : -1}
              aria-hidden={showLogo || isPartners ? undefined : true}
              className={cn(
                "flex shrink-0 items-center rounded-full transition-opacity duration-500 ease-brand",
                showLogo || isPartners
                  ? "opacity-100"
                  : "pointer-events-none opacity-0",
              )}
            >
              {/* Same URL as the homepage hero logo: adds no extra preload. */}
              <img
                src="/assets/tum_ai_logo_new.svg"
                alt=""
                width={1640}
                height={406}
                className="h-6 w-auto md:h-7"
              />
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
              {links.map(({ href, text }) => {
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
                      "relative rounded-full px-3.5 py-2 text-[0.875rem] font-semibold transition-colors duration-300",
                      active
                        ? "text-white"
                        : "text-minimal-gray hover:text-white",
                    )}
                  >
                    {text}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-violet-400"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2 xl:ml-0">
              <ButtonLink
                href={cta.href}
                size="sm"
                arrow={isPartners ? undefined : true}
                className={cn(!isPartners && "hidden sm:inline-flex")}
              >
                {cta.label}
              </ButtonLink>
              <Drawer.Trigger
                aria-label="Open menu"
                className="group/menu grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 xl:hidden"
              >
                <span aria-hidden className="flex w-4 flex-col gap-[5px]">
                  <span className="h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-brand group-hover/menu:translate-x-0.5" />
                  <span className="h-[1.5px] w-2/3 rounded-full bg-current transition-[width] duration-300 ease-brand group-hover/menu:w-full" />
                </span>
              </Drawer.Trigger>
            </div>
          </div>
        </div>
      </header>

      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 bg-ink-950/60 opacity-[calc(1-var(--drawer-swipe-progress,0))] backdrop-blur-sm transition-opacity duration-500 ease-brand data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex justify-end">
          <Drawer.Popup
            data-tone="ink"
            className="group/drawer relative isolate flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain outline-none [transform:translateX(var(--drawer-swipe-movement-x,0px))] transition-transform duration-500 ease-snappy data-[ending-style]:[transform:translateX(100%)] data-[starting-style]:[transform:translateX(100%)] data-[swiping]:select-none motion-reduce:transition-none"
          >
            <div aria-hidden className="grain -z-10" />
            <Aurora intensity="subtle" />
            <Drawer.Content className="flex min-h-full flex-col">
              <div className="flex h-14 items-center justify-between pr-3 pl-5 md:h-[4.25rem] md:px-6 md:pt-2.5">
                <img
                  src="/assets/tum_ai_logo_new.svg"
                  alt=""
                  width={1640}
                  height={406}
                  loading="lazy"
                  className="h-6 w-auto"
                />
                <Drawer.Close
                  aria-label="Close menu"
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-[background-color,rotate] duration-300 ease-brand hover:rotate-90 hover:bg-white/20"
                >
                  <X aria-hidden className="size-4" />
                </Drawer.Close>
              </div>
              <Drawer.Title className="sr-only">Menu</Drawer.Title>
              <nav aria-label="Main" className="flex-1 px-6 pt-8">
                <ul>
                  {links.map(({ href, text }, index) => {
                    const active = isActive(href);
                    return (
                      <li
                        key={href}
                        style={{ transitionDelay: `${90 + index * 45}ms` }}
                        className="transition-[opacity,translate] duration-700 ease-brand group-data-[starting-style]/drawer:translate-x-8 group-data-[starting-style]/drawer:opacity-0 motion-reduce:transition-none"
                      >
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className="group/item flex items-center justify-between border-b border-hairline py-4 text-heading-lg text-fg transition-colors duration-300 hover:text-violet-300"
                        >
                          <span className="flex items-center gap-3">
                            {text}
                            {active ? (
                              <span
                                aria-hidden
                                className="size-1.5 rounded-full bg-violet-400"
                              />
                            ) : null}
                          </span>
                          <ArrowUpRight
                            aria-hidden
                            className="size-5 -translate-x-1 opacity-0 transition-[opacity,translate] duration-300 ease-brand group-hover/item:translate-x-0 group-hover/item:opacity-100"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="px-6 pt-10 pb-8">
                <ButtonLink
                  href={cta.href}
                  size="lg"
                  arrow
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  {cta.label}
                </ButtonLink>
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-small text-fg-muted">
                  {socialLinks.map(({ href, text }) => (
                    <li key={href}>
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="transition-colors duration-300 hover:text-fg"
                      >
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
