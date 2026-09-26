import { cva, type VariantProps } from "class-variance-authority";
import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import type { BlockElement, PolymorphicProps } from "./types";

/**
 * Card surface styles, shared by <Card> and <SpotlightCard>. Exported for
 * surfaces that are another component's root.
 */
export const cardStyles = cva(
  "group/card relative isolate rounded-3xl text-fg",
  {
    variants: {
      /** Surface treatment. */
      variant: {
        /** Solid surface one step above the band. */
        raised: "border border-hairline bg-raised shadow-soft",
        /** Hairline only; for dense grids. */
        outline: "border border-hairline bg-transparent",
        /** Frosted panel for dark bands and imagery. */
        glass:
          "border border-white/10 bg-white/[0.045] shadow-inset-hairline backdrop-blur-md",
        /** No surface: layout and hover behavior only. */
        plain: "",
      },
      /** Inner padding step. */
      padding: {
        none: "",
        sm: "p-5",
        md: "p-6 md:p-7",
        lg: "p-7 md:p-9",
      },
      /** A 4px lift and a stronger shadow on hover (still under reduced motion). */
      interactive: {
        true: "transition-[translate,box-shadow,border-color,background-color] duration-500 ease-brand hover:-translate-y-1 hover:border-hairline-strong hover:shadow-lift motion-reduce:hover:translate-y-0",
        false: "",
      },
    },
    defaultVariants: { variant: "raised", padding: "md", interactive: false },
  },
);

/** The variant props of {@link cardStyles}. */
export type CardStyleProps = VariantProps<typeof cardStyles>;

/** Props for {@link Card}: the root element's props plus the variants. */
export type CardProps<T extends BlockElement = "div"> = PolymorphicProps<
  T,
  CardStyleProps
>;

/**
 * Base surface. Set `interactive` when the whole card is a link, and render
 * it `as="article"` or `as="li"` where the content calls for it.
 */
export function Card<T extends BlockElement = "div">({
  as,
  variant,
  padding,
  interactive,
  className,
  ...props
}: CardProps<T>) {
  // Widened on purpose: narrowed to `T`, JSX would intersect every root's props.
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      className={cn(cardStyles({ variant, padding, interactive }), className)}
      {...props}
    />
  );
}
