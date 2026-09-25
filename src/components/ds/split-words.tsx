import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SplitWordsProps = {
  children: ReactNode;
  /** Delay before the first word, in ms. */
  delay?: number;
  /** Delay between words, in ms. */
  step?: number;
  className?: string;
};

/**
 * Headline entrance: every word rises out of its own line mask (clipped only
 * below the line, so glyph overhangs and tight tracking never get cut). Pure CSS, so
 * it starts before hydration and never delays LCP. Strings are split into
 * words; elements (e.g. <Highlight>) animate as one unit. Reduced motion
 * renders the text statically.
 */
export function SplitWords({
  children,
  delay = 0,
  step = 70,
  className,
}: SplitWordsProps) {
  const units: ReactNode[] = [];
  const collect = (node: ReactNode) => {
    for (const child of Children.toArray(node)) {
      if (typeof child === "string" || typeof child === "number") {
        for (const part of String(child).split(/(\s+)/)) {
          if (part) units.push(part);
        }
      } else if (isValidElement(child)) {
        // Unwrap fragments so `<>Build the <Highlight>…</Highlight></>` still
        // animates word by word.
        if (child.type === Fragment) {
          collect((child.props as { children?: ReactNode }).children);
        } else {
          units.push(child);
        }
      }
    }
  };
  collect(children);

  let wordIndex = 0;
  return (
    <span className={className}>
      {units.map((unit, index) => {
        if (typeof unit === "string" && /^\s+$/.test(unit)) {
          return " ";
        }
        const current = wordIndex++;
        return (
          <span
            key={index}
            className="-mb-[0.28em] inline-block pb-[0.28em] align-bottom [clip-path:inset(-0.6em_-0.35em_0_-0.35em)]"
          >
            <span
              className={cn("inline-block motion-safe:animate-rise")}
              style={{ animationDelay: `${delay + current * step}ms` }}
            >
              {unit}
            </span>
          </span>
        );
      })}
    </span>
  );
}
