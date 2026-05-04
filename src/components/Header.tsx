"use client";

import { getMobileHeaderVisibility } from "@/lib/header-visibility";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [headerBlur, setHeaderBlur] = useState(0);
  const [isMobileHeaderVisible, setIsMobileHeaderVisible] = useState(true);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const previousScrollY = useRef(0);
  const showLogoRef = useRef(false);
  const headerOpacityRef = useRef(0);
  const headerBlurRef = useRef(0);
  const isMobileHeaderVisibleRef = useRef(true);

  const links = [
    { href: "/events", text: "Events" },
    { href: "/research", text: "Research" },
    { href: "/projects", text: "Projects" },
    { href: "/e-lab", text: "Entrepreneurship" },
    { href: "/community", text: "Community" },
    { href: "/partners", text: "Partners" },
    { href: "/qanda", text: "Q&A" },
  ];

  useEffect(() => {
    let frame = 0;

    const updateScrollState = () => {
      const isMobile = window.innerWidth < 768;
      const scrollY = Math.max(window.scrollY, 0);
      const threshold = isMobile
        ? window.innerHeight * 0.3
        : window.innerHeight * 0.6;
      const nextShowLogo = !isHome || scrollY > threshold;
      const nextHeaderOpacity = nextShowLogo ? 0.8 : 0;
      const nextHeaderBlur = nextShowLogo ? 10 : 0;

      if (showLogoRef.current !== nextShowLogo) {
        showLogoRef.current = nextShowLogo;
        setShowLogo(nextShowLogo);
      }

      if (headerOpacityRef.current !== nextHeaderOpacity) {
        headerOpacityRef.current = nextHeaderOpacity;
        setHeaderOpacity(nextHeaderOpacity);
      }

      if (headerBlurRef.current !== nextHeaderBlur) {
        headerBlurRef.current = nextHeaderBlur;
        setHeaderBlur(nextHeaderBlur);
      }

      if (isMobile) {
        const nextMobileHeaderVisible = getMobileHeaderVisibility({
          scrollY,
          previousScrollY: previousScrollY.current,
          isMenuOpen: open,
          isCurrentlyVisible: isMobileHeaderVisibleRef.current,
        });

        if (isMobileHeaderVisibleRef.current !== nextMobileHeaderVisible) {
          isMobileHeaderVisibleRef.current = nextMobileHeaderVisible;
          setIsMobileHeaderVisible(nextMobileHeaderVisible);
        }
      } else {
        if (!isMobileHeaderVisibleRef.current) {
          isMobileHeaderVisibleRef.current = true;
          setIsMobileHeaderVisible(true);
        }
      }

      previousScrollY.current = scrollY;
    };

    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateScrollState();
      });
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isHome, open]);

  useEffect(() => {
    if (open) {
      isMobileHeaderVisibleRef.current = true;
      setIsMobileHeaderVisible(true);
    }

    previousScrollY.current = window.scrollY;
  }, [open]);

  useEffect(() => {
    isMobileHeaderVisibleRef.current = true;
    setIsMobileHeaderVisible(true);
    previousScrollY.current = window.scrollY;
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const headerStyle = {
    "--brand-header-opacity": headerOpacity,
    "--brand-header-blur": `${headerBlur}px`,
  } as CSSProperties;
  const minimalIconButtonStyle = {
    backgroundColor: "transparent",
    backgroundImage: "none",
    border: 0,
    boxShadow: "none",
    color: "white",
    padding: 0,
  } as CSSProperties;

  return (
    <>
      <div
        className={`brand-header-shell fixed top-0 left-0 z-40 flex h-16 w-full items-center px-6 py-10 transition-transform duration-300 ${
          isMobileHeaderVisible
            ? "translate-y-0"
            : "-translate-y-full md:translate-y-0"
        }`}
        style={headerStyle}
      >
        {!showLogo && isHome && (
          <div className="brand-header-overlay absolute inset-0 pointer-events-none" />
        )}
        <Link
          href="/"
          className={`transition-opacity duration-300 flex-shrink-0 ${
            showLogo ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src="/assets/tum_ai_logo_new.svg"
            alt="Logo"
            className="h-10 w-auto flex-shrink-0"
          />
        </Link>
        {/* Desktop nav */}
        <div className="hidden xl:flex items-center gap-6 ml-auto">
          {links.map(({ href, text }) => (
            <Link
              key={href}
              href={href}
              className={`${
                pathname === href
                  ? "text-primary drop-shadow-[0_0_15px_theme(colors.white/20%)] font-semibold"
                  : "text-minimal-gray hover:text-primary hover:drop-shadow-[0_0_15px_theme(colors.white/20%)]"
              } text-[16px] font-bold cursor-pointer whitespace-nowrap`}
            >
              {text}
            </Link>
          ))}
          <Button
            asChild
            variant="outline2"
            className="rounded-md px-6 py-3 text-center flex-shrink-0"
          >
            <Link href="/apply">Become a Member</Link>
          </Button>
        </div>

        {/* Mobile nav button */}
        <div className="ml-auto flex xl:hidden ">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-transparent p-0 text-white transition-opacity duration-200 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            style={minimalIconButtonStyle}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 xl:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <div
        id="mobile-nav"
        className={`fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-black/95 p-6 shadow-xl outline-none transition-transform duration-200 xl:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex justify-end">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-transparent p-0 text-white transition-opacity duration-200 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            style={minimalIconButtonStyle}
          >
            <X size={20} />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav className="mt-6 space-y-4">
          {links.map(({ href, text }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-4 py-2 text-lg ${
                pathname === href
                  ? "text-primary font-semibold"
                  : "text-minimal-gray hover:bg-dark-purple/50 hover:text-white"
              }`}
            >
              {text}
            </Link>
          ))}
          <Button
            asChild
            variant="outline2"
            className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
          >
            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Become a Member
            </Link>
          </Button>
        </nav>
      </div>
    </>
  );
};
