import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";

gsap.registerPlugin(ScrollTrigger);

export const PartnersSection = () => {
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!textRef.current) return;

    // Respect reduced motion and disable on small screens
    const mm = window.matchMedia && window.matchMedia("(max-width: 767px)");
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)");
    if ((mm && mm.matches) || (reduce && reduce.matches)) {
      // ensure elements are visible if animations are disabled
      const elems =
        textRef.current.querySelectorAll<HTMLElement>(".animate-item");
      elems.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const elems =
      textRef.current.querySelectorAll<HTMLElement>(".animate-item");
    if (!elems || elems.length === 0) return;

    // make sure items are hidden initially
    gsap.set(elems, { opacity: 0, y: 20 });

    const trigger = ScrollTrigger.create({
      trigger: textRef.current,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        gsap.to(elems, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
        });
      },
      onEnterBack: () => {
        gsap.to(elems, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
        });
      },
      // onLeave: () => {
      //   gsap.to(elems, {
      //     opacity: 0,
      //     y: 20,
      //     duration: 0.45,
      //     stagger: 0.02,
      //     ease: "power2.in",
      //   });
      // },
      // onLeaveBack: () => {
      //   gsap.to(elems, {
      //     opacity: 0,
      //     y: 20,
      //     duration: 0.45,
      //     stagger: 0.02,
      //     ease: "power2.in",
      //   });
      // },
    });

    return () => {
      try {
        trigger.kill();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center md:flex-row gap-8 px-6 md:px-10 py-10 md:py-15">
      {/* Left image - fill desktop height minus header (82px) */}
      <div className="md:w-4/7 w-full md:h-[calc(92dvh-82px)]">
        <img
          className="rounded-xl w-full h-full object-cover"
          src="/assets/partners_pic.jpg"
          alt="Partners"
        />
      </div>

      {/* Right content */}
      <div
        ref={textRef}
        className="flex flex-col gap-4 md:w-3/7 w-full justify-end text-center md:text-left"
      >
        <h1 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          Join <span className="gradient-text">TUM.ai</span> as a sponsor or
          cooperation partner.
        </h1>
        <p className="text-base sm:text-lg md:text-[1.5rem] animate-item">
          Get access to our exclusive pre-selected talent pool of qualified
          Software/Data Engineers and AI Strategists.
        </p>
        <div className="mt-4 flex flex-col gap-3 w-full justify-center sm:flex-row sm:gap-4 md:justify-start animate-item">
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
            className="w-full rounded-md px-6 py-3 text-center sm:w-auto text-primary hover:text-white hover:bg-primary/80"
          >
            <a
              href="/partners"
              className="w-full bg-black border border-[#A144E9] rounded-md px-6 py-3 text-[#A144E9] text-center sm:w-auto"
            >
              View Our Partners
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
