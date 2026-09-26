import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

export const cardStyles = cva(
  "group/card relative isolate rounded-3xl text-fg",
  {
    variants: {
      variant: {
        /** Solid surface one step above the band. */
        raised: "border border-hairline bg-raised shadow-soft",
        /** Hairline only; for dense grids. */
        outline: "border border-hairline bg-transparent",
        /** Frosted panel for dark bands and imagery. */
        glass:
          "border border-white/10 bg-white/[0.045] shadow-inset-hairline backdrop-blur-md",
        plain: "",
      },
      padding: {
        none: "",
        sm: "p-5",
        md: "p-6 md:p-7",
        lg: "p-7 md:p-9",
      },
      interactive: {
        true: "transition-[translate,box-shadow,border-color,background-color] duration-500 ease-brand hover:-translate-y-1 hover:border-hairline-strong hover:shadow-lift motion-reduce:hover:translate-y-0",
        false: "",
      },
    },
    defaultVariants: { variant: "raised", padding: "md", interactive: false },
  },
);

type CardProps<T extends ElementType> = {
  as?: T;
} & VariantProps<typeof cardStyles> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

/** Base surface. Pair with `interactive` when the whole card is a link. */
export function Card<T extends ElementType = "div">({
  as,
  variant,
  padding,
  interactive,
  className,
  ...props
}: CardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(cardStyles({ variant, padding, interactive }), className)}
      {...props}
    />
  );
}
