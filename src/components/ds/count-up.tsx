"use client";

import { animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Thousands separators ("2,100"); default true. */
  grouping?: boolean;
  /** Seconds. */
  duration?: number;
  className?: string;
};

function formatValue(
  value: number,
  prefix: string,
  suffix: string,
  decimals: number,
  grouping = true,
) {
  return `${prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  })}${suffix}`;
}

/**
 * Number that counts up when scrolled into view. The server renders the final
 * value (SEO, no-JS, reduced motion), screen readers always get the final
 * value, and numbers already visible on load are left untouched to avoid a
 * flash.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  grouping = true,
  duration = 1.8,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const finalText = formatValue(value, prefix, suffix, decimals, grouping);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    node.textContent = formatValue(0, prefix, suffix, decimals, grouping);
    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const controls = animate(0, value, {
          duration,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (latest) => {
            node.textContent = formatValue(
              latest,
              prefix,
              suffix,
              decimals,
              grouping,
            );
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
      node.textContent = formatValue(value, prefix, suffix, decimals, grouping);
    };
  }, [value, prefix, suffix, decimals, grouping, duration]);

  return (
    <span className={cn("tabular", className)}>
      <span aria-hidden ref={ref}>
        {finalText}
      </span>
      <span className="sr-only">{finalText}</span>
    </span>
  );
}
