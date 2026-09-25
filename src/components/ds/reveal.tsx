"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type JSX,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";

export type RevealVariant = "up" | "fade" | "scale" | "left" | "right" | "line";

type RevealState = "idle" | "pending" | "done";

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: keyof JSX.IntrinsicElements;
  variant?: RevealVariant;
  /** Delay in ms; use `index * 80` for staggered lists. */
  delay?: number;
};

/* One shared observer for every Reveal on the page. */
const listeners = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function observe(node: Element, onEnter: () => void) {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        listeners.get(entry.target)?.();
        listeners.delete(entry.target);
        sharedObserver?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  listeners.set(node, onEnter);
  sharedObserver.observe(node);
  return () => {
    listeners.delete(node);
    sharedObserver?.unobserve(node);
  };
}

/**
 * Scroll-triggered entrance. Progressive enhancement by construction:
 * server HTML and no-JS visitors see content immediately; only elements that
 * start below the fold are hidden (after hydration) and revealed once. Reduced
 * motion disables it entirely. For above-the-fold content use the CSS
 * `motion-safe:animate-rise*` utilities instead.
 */
export function Reveal({
  as = "div",
  variant = "up",
  delay = 0,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight * 0.94) return;

    setState("pending");
    return observe(node, () => setState("done"));
  }, []);

  const Component = as as "div";
  return (
    <Component
      ref={ref as Ref<HTMLDivElement>}
      data-reveal={state}
      data-reveal-variant={variant}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties)
          : style
      }
      {...props}
    >
      {children}
    </Component>
  );
}
