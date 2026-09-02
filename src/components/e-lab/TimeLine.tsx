"use client";

import { useEffect, useRef, useState } from "react";

import { programSteps } from "@/data/e-lab/venture-page";

export const Timeline = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const visibleTop = Math.max(0, window.innerHeight - rect.top);
      const visibleHeight = Math.min(visibleTop, rect.height);
      setScrollProgress(Math.min(1, Math.max(0, visibleHeight / rect.height)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="flex w-full flex-col items-center justify-center bg-white px-4 py-12 lg:py-16">
      <h2 className="mb-8 text-center text-title font-semibold tracking-tight text-black sm:text-2xl md:text-[2rem]">
        Program
      </h2>
      <div ref={timelineRef} className="relative mx-auto w-full max-w-5xl">
        <div className="absolute top-8 bottom-8 left-6 w-1 -translate-x-1/2 rounded-full bg-gray-300 md:left-1/2">
          <div
            className="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-primary to-purple-300 transition-all duration-300 ease-out"
            style={{
              height: scrollProgress * 100 + "%",
              boxShadow:
                scrollProgress > 0
                  ? "0 0 20px rgba(168, 85, 247, 0.5)"
                  : "none",
            }}
          />
        </div>

        <ol className="relative space-y-14 md:space-y-16">
          {programSteps.map((item, index) => {
            const isActive =
              Math.max(
                0,
                Math.min(1, scrollProgress * programSteps.length - index),
              ) > 0;
            const isLeft = index % 2 === 0;
            const contentPosition = isLeft
              ? "md:mr-auto md:pr-12 md:text-right"
              : "md:ml-auto md:pr-0 md:pl-12";
            const inactiveOffset = isLeft
              ? "md:translate-x-8"
              : "md:-translate-x-8";

            return (
              <li key={item.id} className="relative min-h-24">
                <div className="absolute top-1 left-6 z-10 -translate-x-1/2 md:left-1/2">
                  <div
                    className={
                      "relative h-8 w-8 rounded-full border-4 transition-all duration-300 " +
                      (isActive
                        ? "scale-110 border-purple-300 bg-primary shadow-lg shadow-purple-300/50"
                        : "scale-100 border-gray-400 bg-white")
                    }
                  >
                    {isActive ? (
                      <div className="absolute inset-0 animate-ping rounded-full bg-dark-purple opacity-30 motion-reduce:animate-none" />
                    ) : null}
                  </div>
                </div>

                <div
                  className={
                    "w-full pl-16 text-left md:w-1/2 md:pl-0 " + contentPosition
                  }
                >
                  <div
                    className={
                      "transition-all duration-500 motion-reduce:transform-none " +
                      (isActive
                        ? "translate-x-0 opacity-100"
                        : inactiveOffset + " opacity-60")
                    }
                  >
                    <h3
                      className={
                        "mb-2 text-xl font-semibold leading-snug transition-colors duration-300 " +
                        (isActive ? "text-dark-purple" : "text-gray-800")
                      }
                    >
                      {item.title}
                    </h3>
                    <p
                      className={
                        "text-sm leading-relaxed transition-colors duration-300 " +
                        (isActive ? "text-primary" : "text-text-gray")
                      }
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-12 text-center text-base font-medium text-text-gray">
        Your journey continues...
      </p>
    </section>
  );
};
