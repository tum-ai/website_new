import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isExternalHref } from "./internal";

/** Props for {@link QuoteMark}. */
export type QuoteMarkProps = Omit<
  ComponentProps<"svg">,
  "children" | "viewBox" | "fill"
>;

/**
 * The house opening quotation mark, in the tone's accent color. Decorative:
 * the quote itself sits in a `blockquote`.
 */
export function QuoteMark({ className, ...props }: QuoteMarkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 34 24"
      fill="currentColor"
      className={cn("h-6 w-8 shrink-0 text-highlight", className)}
      {...props}
    >
      <path d="M0 24V14.4C0 6.24 4.32 1.44 12.96 0l1.44 3.36C9.6 4.8 7.2 7.68 7.2 12H13.2V24H0Zm18.8 0V14.4C18.8 6.24 23.12 1.44 31.76 0l1.44 3.36C28.4 4.8 26 7.68 26 12H32V24H18.8Z" />
    </svg>
  );
}

const quoteCardStyles = cva(
  "relative flex h-full flex-col rounded-3xl p-7 md:p-8",
  {
    variants: {
      /** `raised` for light bands; `glass` is the frosted panel for dark bands. */
      variant: {
        raised: "border border-hairline bg-raised shadow-soft",
        glass:
          "border border-white/10 bg-white/[0.045] shadow-inset-hairline backdrop-blur-md",
      },
    },
    defaultVariants: { variant: "raised" },
  },
);

/** An image in a quote card: its source and text alternative. */
export type QuoteImage = {
  /** Image URL. Remote (CMS) URLs skip the image optimizer. */
  src: string;
  /** Text alternative; "" for a portrait the name already describes. */
  alt?: string;
};

/** Props for {@link QuoteCard}. */
export type QuoteCardProps = Omit<ComponentProps<"figure">, "children"> &
  VariantProps<typeof quoteCardStyles> & {
    /** The quotation, without quote marks. */
    quote: ReactNode;
    /** Who said it. */
    name: string;
    /**
     * Line under the name: role and affiliation. (Not `role`, which stays
     * the figure's ARIA role.)
     */
    byline?: ReactNode;
    /** Round portrait before the name. */
    portrait?: QuoteImage;
    /** Organization logo at the end of the person row. */
    logo?: QuoteImage & { alt: string };
    /** Short context beside the quote mark (e.g. a <Tag> with the cohort). */
    context?: ReactNode;
    /** Row under the person (e.g. the organization on a logo chip). */
    footer?: ReactNode;
    /** Load the images eagerly, e.g. inside a moving marquee. */
    eager?: boolean;
  };

/** Testimonial: quote mark, quotation, and a person row with portrait. */
export function QuoteCard({
  quote,
  name,
  byline,
  portrait,
  logo,
  context,
  footer,
  eager = false,
  variant,
  className,
  ...props
}: QuoteCardProps) {
  const loading = eager ? "eager" : "lazy";
  return (
    <figure className={cn(quoteCardStyles({ variant }), className)} {...props}>
      <div className="flex min-h-7 items-center justify-between gap-4">
        <QuoteMark />
        {context}
      </div>
      <blockquote className="mt-6 flex-1 text-fg text-lead">{quote}</blockquote>
      <figcaption className="mt-8">
        <div className="flex items-center gap-4">
          {portrait ? (
            <Image
              src={portrait.src}
              alt={portrait.alt ?? ""}
              width={52}
              height={52}
              loading={loading}
              unoptimized={isExternalHref(portrait.src)}
              className="size-12 shrink-0 rounded-full object-cover ring-2 ring-hairline"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-fg text-heading-sm">{name}</p>
            {byline ? (
              <p className="text-fg-muted text-meta">{byline}</p>
            ) : null}
          </div>
          {logo ? (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={96}
              height={24}
              loading={loading}
              unoptimized={isExternalHref(logo.src)}
              className="h-6 w-auto max-w-24 shrink-0 object-contain opacity-80"
            />
          ) : null}
        </div>
        {footer}
      </figcaption>
    </figure>
  );
}
