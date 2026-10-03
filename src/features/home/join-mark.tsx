"use client";

import { BrandMark } from "@tum.ai/ui-kit";
import { useEffect, useRef, useState } from "react";
import { ConstructionLines } from "./construction-lines";

/** How much of the mark must show before it starts drawing. */
const DRAW_THRESHOLD = 0.25;

/** Width of the mark's viewBox, which the wrapper's box matches. */
const VIEWBOX_WIDTH = 477;

type DrawState = "idle" | "pending" | "drawing";

/**
 * The join band's logomark and its construction sheet (lg+), drawn once the
 * first time the band scrolls into view: the guides run out, the circles and
 * the mark's outline trace in, then the fill comes up and the outline fades,
 * leaving exactly the static mark (choreography in home.css, `data-draw`).
 *
 * Progressive enhancement like the kit's `Reveal`: the server renders the
 * finished mark (`idle`); only a mark that starts below the viewport, with
 * motion allowed, is held back after hydration (`pending`) and drawn on
 * entry (`drawing`), then returns to `idle`. The wrapper keeps
 * `data-footer-bleed` and the `home-join-mark` box, which the footer's
 * continuation of the mark reads.
 */
export function JoinMark() {
  const rootRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<DrawState>("idle");

  useEffect(() => {
    const root = rootRef.current;
    const outline = outlineRef.current?.querySelector("path");
    if (!root || !outline) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (root.getBoundingClientRect().top < window.innerHeight) return;

    // The outline's dash runs its full length, in viewBox units; the
    // sheet's non-scaling circles count theirs in screen pixels.
    const measure = () => {
      root.style.setProperty("--mark-length", String(outline.getTotalLength()));
      root.style.setProperty(
        "--sheet-scale",
        String(root.getBoundingClientRect().width / VIEWBOX_WIDTH),
      );
    };
    measure();
    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        measure();
        setState("drawing");
      },
      { threshold: DRAW_THRESHOLD },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-footer-bleed=""
      data-draw={state}
      onAnimationEnd={(event) => {
        // The outline's fade is the last step; the static mark takes over.
        if (event.animationName === "home-draw-fade-out") setState("idle");
      }}
      className="home-join-mark absolute -z-10 aspect-[477/406] opacity-60 lg:opacity-100"
    >
      <BrandMark
        drift={false}
        intensity="medium"
        className="home-join-fill absolute inset-0 size-full"
      />
      <ConstructionLines
        reach="long"
        className="absolute inset-0 hidden size-full text-violet-300 lg:block"
      />
      <BrandMark
        ref={outlineRef}
        drift={false}
        stroke="currentColor"
        strokeWidth={0.8}
        style={{ fill: "none" }}
        className="home-join-outline absolute inset-0 size-full text-violet-300"
      />
    </div>
  );
}
