import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type SplitWordsProps = {
  children: ReactNode;
  /** Delay before the first word, in ms. */
  delay?: number;
  /** Delay between words, in ms. */
  step?: number;
  className?: string;
};

/**
 * Headline entrance: words rise, fade and sharpen in sequence. Each word's box
 * is padded (and pulled back with negative margins, so layout is unchanged) to
 * contain descenders and overhangs at tight display line-heights; Safari clips
 * filtered elements to their box. Pure CSS, so it starts before hydration and
 * never delays LCP. Strings are split into
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
            className={cn(
              "-mx-[0.06em] -mt-[0.12em] -mb-[0.32em] inline-block px-[0.06em] pt-[0.12em] pb-[0.32em] motion-safe:animate-rise",
            )}
            style={{ animationDelay: `${delay + current * step}ms` }}
          >
            {unit}
          </span>
        );
      })}
    </span>
  );
}
