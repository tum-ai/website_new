"use client";

import { m, useScroll, useSpring, useTransform } from "framer-motion";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * True only after hydration, and only when the visitor allows motion.
 * Scroll-linked styles must not render on the server: the server cannot know
 * the visitor's reduced-motion preference, and a mismatch breaks hydration.
 */
function useScrollMotionEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return enabled;
}

/** Props for {@link Parallax}. */
export type ParallaxProps = {
  /** The layer that drifts. */
  children: ReactNode;
  /** Pixels travelled across the element's pass through the viewport. Default 60. */
  offset?: number;
  /** Classes for the moving wrapper. */
  className?: string;
};

/**
 * Scroll-linked vertical drift for decorative layers and media. Static on
 * the server and under reduced motion.
 */
export function Parallax({ children, offset = 60, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useScrollMotionEnabled();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [offset, -offset]),
    { stiffness: 120, damping: 30, mass: 0.4 },
  );

  return (
    <m.div ref={ref} className={className} style={enabled ? { y } : undefined}>
      {children}
    </m.div>
  );
}

/** Props for {@link ScrollProgress}. */
export type ScrollProgressProps = {
  /** Element whose scroll pass drives the progress (0 → 1). */
  target: RefObject<HTMLElement | null>;
  /** Classes for the bar (size, position, color). */
  className?: string;
  /** Fill direction: `y` grows downwards (default), `x` to the right. */
  axis?: "x" | "y";
};

/**
 * A bar that fills as `target` scrolls past the middle of the viewport.
 * Server render and reduced motion show it fully filled.
 */
export function ScrollProgress({
  target,
  className,
  axis = "y",
}: ScrollProgressProps) {
  const enabled = useScrollMotionEnabled();
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
        !enabled
          ? undefined
          : axis === "y"
            ? { scaleY: progress, transformOrigin: "top" }
            : { scaleX: progress, transformOrigin: "left" }
      }
    />
  );
}
