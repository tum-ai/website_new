import type { ReactNode } from "react";
import { BrandMark } from "@/components/ds";
import { cn } from "@/lib/cn";

/* Three compositions so neighbouring placeholders don't look copy-pasted.
   Only the position of the light and the mark changes; the colors stay in
   the brand violets. */
const glows = [
  "bg-[radial-gradient(95%_75%_at_12%_8%,rgb(154_100_217/0.55),transparent_62%)]",
  "bg-[radial-gradient(90%_70%_at_92%_14%,rgb(154_100_217/0.5),transparent_62%)]",
  "bg-[radial-gradient(110%_80%_at_50%_104%,rgb(154_100_217/0.5),transparent_62%)]",
] as const;

const marks = [
  "-right-[30%] -bottom-[16%] w-[112%]",
  "-left-[34%] -bottom-[20%] w-[118%]",
  "-right-[18%] -top-[14%] w-[96%] rotate-180",
] as const;

/**
 * Decorative stand-in for a missing photo: an ink panel with violet light and
 * the logomark as a tonal shape. Fills its positioned parent. `children` can
 * add typographic art (e.g. a collaborator name); it is hidden from assistive
 * tech because the same text is rendered next to the placeholder.
 */
export function BrandPlaceholder({
  seed = 0,
  className,
  children,
}: {
  /** Picks one of the compositions, e.g. the item's index. */
  seed?: number;
  className?: string;
  children?: ReactNode;
}) {
  const variant = Math.abs(seed) % glows.length;
  return (
    <div
      aria-hidden
      data-tone="ink"
      className={cn("absolute inset-0 isolate overflow-hidden", className)}
    >
      <div className={cn("absolute inset-0 -z-10", glows[variant])} />
      <BrandMark
        drift={false}
        className={cn(
          "absolute -z-10 text-white/[0.07] transition-transform duration-[1.4s] ease-brand group-hover/media:scale-[1.04] motion-reduce:transition-none",
          marks[variant],
        )}
      />
      <div className="grain -z-10" />
      {children}
    </div>
  );
}
