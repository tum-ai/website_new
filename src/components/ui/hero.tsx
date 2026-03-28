import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Button } from "./button";

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!heroRef.current) return;

    const mm = window.matchMedia && window.matchMedia("(max-width: 767px)");
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)");
    const el = heroRef.current as HTMLElement;
    if ((mm && mm.matches) || (reduce && reduce.matches)) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    gsap.set(el, { opacity: 0, y: 20 });
    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 1,
    });

    return () => {
      try {
        tween.kill();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);
  return (
    <div
      ref={heroRef}
      className="flex flex-col items-start justify-center sm:justify-end px-4 py-6 sm:px-8 sm:py-12"
    >
      {/* Logo */}
      <img src="/assets/tum_ai_logo_new.svg" alt="TUM.ai New Logo" className="h-10 w-auto mb-4 ml-1" />

      <p className="mt-2 font-thin text-title sm:text-4xl leading-snug w-full sm:max-w-8/12 mb-2">
        Germany’s leading student initiative focused on
        <b className="bg-gradient-to-r font-medium from-[#9A64D9] to-[#F5EFFF] bg-clip-text text-transparent">
          {" "}
          Artificial Intelligence.
        </b>
      </p>

      <div className="mt-4 flex flex-col gap-3 w-full sm:flex-row sm:gap-4 justify-start">
        <Button
          asChild
          variant="primary"
          className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
        >
          <a href="mailto:partners@tum-ai.com">Become a Partner</a>
        </Button>

        <Button
          asChild
          variant="outline2"
          className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
        >
          <a
            href="/apply"
            className="w-full bg-transparent border border-[#A144E9] rounded-md px-6 py-3 text-[#A144E9] text-center sm:w-auto"
          >
            Become a Member
          </a>
        </Button>
      </div>
    </div>
  );
};
