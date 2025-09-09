import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Apply() {
  const staggerDelay = 0.1;

  return (
    <>
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 to-purple-950 px-4 text-white">
        <div className="relative z-10 max-w-4xl space-y-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto flex items-center justify-center"
          >
            <img
              src="/assets/logo_new_white_standard.png"
              alt="TUM.ai Logo"
              width={300}
              height={66}
              className="mx-auto"
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: staggerDelay, ease: "easeOut" }}
            className="text-xl font-light tracking-wide md:text-2xl"
          >
            <span className="relative"></span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: staggerDelay * 2,
              ease: "easeOut",
            }}
            className="flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <Button
              asChild
              variant="primary"
              className="w-full rounded-md px-12 py-4 sm:w-auto"
            >
              <a href="/apply/munich">Munich</a>
            </Button>

            <Button
              asChild
              variant="primary"
              className="w-full rounded-md px-12 py-4 sm:w-auto"
            >
              <a href="/apply/berlin">Berlin</a>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
