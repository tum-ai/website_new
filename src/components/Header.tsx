import { Link } from "react-router-dom";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export const Header = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", text: "Home" },
    { href: "/events", text: "Events" },
    { href: "/research", text: "Research" },
    { href: "/projects", text: "Projects" },
    { href: "/e-lab", text: "Entrepreneurship" },
    { href: "/community", text: "Community" },
    { href: "/partners", text: "Partners" },
    { href: "/qanda", text: "Q&A" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#0B0213] h-16 flex items-center px-6">
      {/* Desktop nav */}
      <div className="hidden lg:flex items-center gap-8 ml-auto">
        {links.map(({ href, text }) => (
          <Link
            key={href}
            className={`${
              href !== "/"
                ? "text-gray-300 hover:text-white"
                : "text-[#A144E9] font-semibold"
            } text-[16px] cursor-pointer`}
            to={href}
          >
            {text}
          </Link>
        ))}
        <Link
          target="_blank"
          to="https://join.tum-ai.com/"
          className="ml-4 px-4 py-1.5 border border-[#A144E9] text-white rounded-md hover:bg-[#A144E9] hover:text-white transition"
        >
          Join Us
        </Link>
      </div>

      {/* Mobile nav button */}
      <div className="ml-auto flex lg:hidden ">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button className="flex h-9 w-9 items-center justify-center rounded-md text-white/90 hover:bg-purple-800/50">
              <Menu size={20} className="" />
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
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0B0213] p-6 shadow-xl"
                  >
                    <div className="flex justify-end">
                      <Dialog.Close asChild>
                        <Button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-white/90 hover:bg-purple-800/50"
                          onClick={() => setOpen(false)}
                        >
                          <X size={20} />
                          <span className="sr-only">Close menu</span>
                        </Button>
                      </Dialog.Close>
                    </div>

                    <nav className="mt-6 space-y-4">
                      {links.map(({ href, text }) => (
                        <Link
                          key={href}
                          to={href}
                          onClick={() => setOpen(false)}
                          className={`block rounded-md px-4 py-2 text-lg ${
                            href !== "/"
                              ? "text-gray-300 hover:bg-purple-800/50 hover:text-white"
                              : "text-[#A144E9] font-semibold"
                          }`}
                        >
                          {text}
                        </Link>
                      ))}
                      <Link
                        to="https://join.tum-ai.com/"
                        onClick={() => setOpen(false)}
                        className="mt-4 block rounded-md bg-[#A144E9] px-4 py-2 text-lg text-white hover:bg-[#8727c7]"
                      >
                        Join Us
                      </Link>
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
