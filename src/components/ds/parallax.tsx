"use client";

import {
  m,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { type ReactNode, type RefObject, useRef } from "react";

type ParallaxProps = {
  children: ReactNode;
  /** Pixels travelled across the element's pass through the viewport. */
  offset?: number;
  className?: string;
};

/** Scroll-linked vertical drift for decorative layers and media. */
export function Parallax({ children, offset = 60, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [offset, -offset]),
    { stiffness: 120, damping: 30, mass: 0.4 },
  );

  return (
    <m.div
      ref={ref}
      className={className}
      style={reduceMotion ? undefined : { y }}
    >
      {children}
    </m.div>
  );
}

type ScrollProgressProps = {
  /** Element whose scroll pass drives the progress (0 → 1). */
  target: RefObject<HTMLElement | null>;
  className?: string;
  axis?: "x" | "y";
};

/**
 * A bar that fills as `target` scrolls past the middle of the viewport.
 * Reduced motion shows it fully filled.
 */
export function ScrollProgress({
  target,
  className,
  axis = "y",
}: ScrollProgressProps) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 65%", "end 55%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.5,
  });

  return (
    <m.div
      aria-hidden
      className={className}
      style={
        reduceMotion
          ? undefined
          : axis === "y"
            ? { scaleY: progress, transformOrigin: "top" }
            : { scaleX: progress, transformOrigin: "left" }
      }
    />
  );
}
