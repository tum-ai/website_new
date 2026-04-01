import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [headerBlur, setHeaderBlur] = useState(0);
  const location = useLocation();

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
    if (location.pathname !== "/") {
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
  }, [location.pathname]);

  const headerStyle = {
    "--brand-header-opacity": headerOpacity,
    "--brand-header-blur": `${headerBlur}px`,
  } as CSSProperties;

  return (
    <div
      className="brand-header-shell fixed top-0 left-0 z-50 flex h-16 w-full items-center px-6 py-10"
      style={headerStyle}
    >
      {!showLogo && location.pathname === "/" && (
        <div className="brand-header-overlay absolute inset-0 pointer-events-none" />
      )}
      <a
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
      </a>
      {/* Desktop nav */}
      <div className="hidden xl:flex items-center gap-6 ml-auto">
        {links.map(({ href, text }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `${
                isActive
                  ? "text-primary drop-shadow-[0_0_15px_theme(colors.white/20%)] font-semibold"
                  : "text-minimal-gray hover:text-primary hover:drop-shadow-[0_0_15px_theme(colors.white/20%)]"
              } text-[16px] font-bold cursor-pointer whitespace-nowrap`
            }
          >
            {text}
          </NavLink>
        ))}
        <Button
          asChild
          variant="outline2"
          className="rounded-md px-6 py-3 text-center flex-shrink-0"
        >
          <NavLink to="/apply">Become a Member</NavLink>
        </Button>
      </div>

      {/* Mobile nav button */}
      <div className="ml-auto flex xl:hidden ">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button variant="primary" className="h-9 w-9 p-0">
              <Menu size={20} />
              <span className="sr-only">Open menu</span>
            </Button>
          </Dialog.Trigger>

          <AnimatePresence>
            {open && (
              <Dialog.Portal forceMount>
                <Dialog.Overlay asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                  />
                </Dialog.Overlay>

                <Dialog.Content asChild>
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-black/95 p-6 shadow-xl outline-none"
                  >
                    <div className="flex justify-end">
                      <Dialog.Close asChild>
                        <Button variant="primary" className="h-9 w-9 p-0">
                          <X size={20} />
                          <span className="sr-only">Close menu</span>
                        </Button>
                      </Dialog.Close>
                    </div>

                    <nav className="mt-6 space-y-4">
                      {links.map(({ href, text }) => (
                        <NavLink
                          key={href}
                          to={href}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-md px-4 py-2 text-lg ${
                              isActive
                                ? "text-primary font-semibold"
                                : "text-minimal-gray hover:bg-dark-purple/50 hover:text-white"
                            }`
                          }
                        >
                          {text}
                        </NavLink>
                      ))}
                      <Button
                        asChild
                        variant="outline2"
                        className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
                      >
                        <NavLink
                          to="/apply"
                          onClick={() => setOpen(false)}
                          className="w-full"
                        >
                          Become a Member
                        </NavLink>
                      </Button>
                    </nav>
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>
        </Dialog.Root>
      </div>
    </div>
  );
};
