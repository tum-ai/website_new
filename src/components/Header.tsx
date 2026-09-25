"use client";

import { Dialog } from "@base-ui/react/dialog";
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
import { BrandMark } from "@/components/ds/brand-mark";
import { ButtonLink } from "@/components/ds/button";
import { useInertBackground } from "@/components/ds/dialog";
import { contactEmails, socialLinks } from "@/config/contact";
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

const connectLinks = [
  { href: socialLinks.linkedin, text: "LinkedIn" },
  { href: socialLinks.instagram, text: "Instagram" },
  { href: `mailto:${contactEmails.general}`, text: "Email" },
];

/**
 * Site header: a floating pill, always visible.
 *
 * - Transparent over the dark page hero; frosted once the page scrolls.
 * - The fixed element starts 12px below the top edge on purpose: Safari 26
 *   tints its status bar from fixed elements touching the top, and we want
 *   the page itself to show through there once it scrolls.
 * - Home keeps the logo hidden until the hero (which shows it large) scrolls
 *   away. /partners keeps the pill frosted and swaps the CTA for its in-page
 *   contact anchor.
 * - Below xl the navigation opens as a full-screen Base UI Dialog (focus
 *   trap, scroll lock, Escape, focus return; deliberately no swipe gesture).
 *   Its flat dark-indigo panel covers the whole large viewport, so Safari's
 *   top and bottom bars both tint to the same color and nothing of the page
 *   shows below it.
 * - Pill bottom stays within 80px: /partners anchors use a 110px scroll margin.
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

  // The page behind the open menu is inert (see useInertBackground).
  useInertBackground(open);

  const solid = isPartners || scrolled || open;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const cta = isPartners
    ? { href: "#partner-contact", label: "Become a partner" }
    : { href: "/apply", label: "Become a Member" };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className="pointer-events-none fixed inset-x-0 top-2.5 z-40 md:top-3">
        <div className="mx-auto w-[min(82rem,calc(100%-1.25rem))] md:w-[min(82rem,calc(100%-2*var(--gutter)+2rem))]">
          <div
            className={cn(
              "pointer-events-auto relative flex h-14 items-center gap-2 rounded-full border pr-2 pl-4 text-white transition-[background-color,border-color,box-shadow] duration-500 ease-brand md:pl-5",
              solid
                ? "border-white/10 bg-[#0d0214]/75 shadow-[0_16px_40px_-18px_rgb(13_2_20/0.8)] backdrop-blur-xl backdrop-saturate-150"
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
                className={cn("h-10", !isPartners && "hidden sm:inline-flex")}
              >
                {cta.label}
              </ButtonLink>
              <Dialog.Trigger
                aria-label="Open menu"
                className="group/menu grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 xl:hidden"
              >
                <span aria-hidden className="flex w-4 flex-col gap-[5px]">
                  <span className="h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-brand group-hover/menu:translate-x-0.5" />
                  <span className="h-[1.5px] w-2/3 rounded-full bg-current transition-[width] duration-300 ease-brand group-hover/menu:w-full" />
                </span>
              </Dialog.Trigger>
            </div>
          </div>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-x-0 top-0 z-50 h-lvh bg-ink-950/60 backdrop-blur-sm transition-opacity duration-500 ease-brand data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          data-tone="ink"
          className="group/menu-panel fixed top-0 right-0 z-50 isolate h-lvh w-full max-w-md overflow-y-auto overscroll-contain bg-canvas outline-none transition-[translate] duration-500 ease-snappy data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full motion-reduce:transition-none"
        >
          <BrandMark
            drift={false}
            className="absolute right-[-18%] bottom-[18%] -z-10 w-[85%] text-white/[0.035]"
          />
          {/* Content fills the visible viewport; the panel itself extends under Safari's toolbars. */}
          {/*
           * min-h-lvh + bottom padding of (lvh - dvh): the layout fills the
           * visible viewport, and when the menu overflows (small phones,
           * landscape) its last row can still scroll above Safari's toolbar.
           */}
          <div className="flex min-h-lvh flex-col pb-[calc(100lvh-100dvh)]">
            <div className="flex h-[4.25rem] items-center justify-between pt-2 pr-[1.1875rem] pl-[1.6875rem] md:pt-3 md:pr-[calc(var(--gutter)-0.4375rem)] md:pl-8">
              <img
                src="/assets/tum_ai_logo_new.svg"
                alt=""
                width={1640}
                height={406}
                loading="lazy"
                className="h-6 w-auto md:h-7"
              />
              <Dialog.Close
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-[background-color,rotate] duration-300 ease-brand hover:rotate-90 hover:bg-white/20"
              >
                <X aria-hidden className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <nav aria-label="Main" className="flex-1 px-6 pt-8">
              <ul>
                {links.map(({ href, text }, index) => {
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
                {connectLinks.map(({ href, text }) => (
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
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
