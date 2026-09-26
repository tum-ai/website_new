import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's stock scales. Without registering the
 * design-system tokens from src/styles/index.css it would treat
 * `text-display-xl` as a color and drop it next to `text-fg`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-2xl",
        "display-xl",
        "display-lg",
        "display-md",
        "heading-lg",
        "heading-md",
        "heading-sm",
        "lead",
        "body",
        "small",
        "meta",
        "eyebrow",
        "title",
        "subtitle",
        "subtext",
      ],
      color: [
        "canvas",
        "raised",
        "sunken",
        "fg",
        "fg-muted",
        "fg-subtle",
        "hairline",
        "hairline-strong",
        "highlight",
        "glow",
      ],
      shadow: ["soft", "lift", "glow", "inset-hairline"],
      radius: ["4xl", "5xl"],
      ease: ["brand", "snappy", "in-out-soft"],
      animate: [
        "rise",
        "rise-sm",
        "fade",
        "aurora",
        "drift",
        "marquee",
        "marquee-reverse",
        "pulse-ring",
        "shimmer",
        "line",
      ],
    },
  },
});

/**
 * Joins class names (clsx) and resolves Tailwind conflicts (tailwind-merge
 * with the design-system tokens): when two classes set the same property, the
 * later one wins.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
