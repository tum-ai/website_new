import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

export type Tone = "paper" | "mist" | "lavender" | "ink" | "night" | "violet";

const spacing = {
  none: "",
  sm: "py-14 md:py-20",
  md: "py-20 md:py-28",
  lg: "py-24 md:py-36",
  xl: "py-28 md:py-44",
} as const;

type SectionProps<T extends ElementType> = {
  as?: T;
  /** Surface band. Sets the semantic color tokens for everything inside. */
  tone?: Tone;
  spacing?: keyof typeof spacing;
  /** Film grain overlay; use on dark bands only. */
  grain?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * A full-bleed page band. Children read `bg-canvas`, `text-fg`,
 * `text-fg-muted`, `border-hairline` and `text-highlight`, which resolve per
 * tone, so the same component works on light and dark bands.
 */
export function Section<T extends ElementType = "section">({
  as,
  tone = "paper",
  spacing: space = "md",
  grain = false,
  className,
  children,
  ...props
}: SectionProps<T>) {
  const Component = as ?? "section";
  return (
    <Component
      data-tone={tone}
      className={cn("relative isolate", spacing[space], className)}
      {...props}
    >
      {grain ? <div aria-hidden className="grain -z-10" /> : null}
      {children}
    </Component>
  );
}
