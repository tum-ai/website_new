"use client";

import { animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** "2.3%" → { prefix: "", value: 2.3, decimals: 1, suffix: "%" }. */
function parse(text: string) {
  const match = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(text);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  return {
    prefix,
    suffix,
    value: Number(digits),
    decimals: digits.split(".")[1]?.length ?? 0,
  };
}

/**
 * Counts a copy figure such as "2100+", "1.2M+" or "+1000" up from zero when
 * it scrolls into view, always settling on the exact source string.
 *
 * DS `CountUp` groups thousands ("2,100+") and `StatGrid` drops decimals, which
 * would alter the approved copy, so this mirrors CountUp's contract instead:
 * the server renders the final text, screen readers only ever get the final
 * text, and reduced motion or figures already on screen stay untouched.
 */
export function StatValue({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    const parsed = parse(value);
    if (!node || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    const format = (current: number) =>
      `${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`;
    node.textContent = format(0);
    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const controls = animate(0, parsed.value, {
          duration: 1.8,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (latest) => {
            node.textContent = format(latest);
          },
          onComplete: () => {
            node.textContent = value;
          },
        });
        stop = () => controls.stop();
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop?.();
      node.textContent = value;
    };
  }, [value]);

  return (
    <span className={cn("tabular", className)}>
      <span aria-hidden ref={ref}>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
