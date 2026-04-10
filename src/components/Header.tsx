"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useState } from "react";
import { Button } from "./ui/button";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [headerBlur, setHeaderBlur] = useState(0);
  const pathname = usePathname();
  const isHome = pathname === "/";

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
    if (!isHome) {
      setShowLogo(true);
      setHeaderOpacity(0.8);
      setHeaderBlur(10);
      return;
    }

    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile
        ? window.innerHeight * 0.3
        : window.innerHeight * 0.6;

      if (window.scrollY > threshold) {
        setShowLogo(true);
        setHeaderOpacity(0.8);
        setHeaderBlur(10);
      } else {
        setShowLogo(false);
        setHeaderOpacity(0);
        setHeaderBlur(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

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

  return (
    <div
      className="brand-header-shell fixed top-0 left-0 z-50 flex h-16 w-full items-center px-6 py-10"
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
        <Button
          variant="primary"
          className="h-9 w-9 p-0"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </Button>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 xl:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <div
        id="mobile-nav"
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-black/95 p-6 shadow-xl outline-none transition-transform duration-200 xl:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="flex justify-end">
          <Button
            variant="primary"
            className="h-9 w-9 p-0"
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
            <span className="sr-only">Close menu</span>
          </Button>
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
    </div>
  );
};
