import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isExternalHref, isNonRouteHref } from "./internal";

const textLinkStyles = cva(
  "group/link inline-flex items-center gap-1.5 font-semibold transition-colors duration-300 ease-brand",
  {
    variants: {
      /** `accent` for links in copy, `muted` for dense lists (footer, meta rows). */
      emphasis: {
        accent: "text-highlight hover:text-fg",
        muted: "text-fg-muted hover:text-fg",
      },
    },
    defaultVariants: { emphasis: "accent" },
  },
);

/** The link colors {@link TextLink} can take. */
export type TextLinkEmphasis = NonNullable<
  VariantProps<typeof textLinkStyles>["emphasis"]
>;

/** Props for {@link TextLink}. */
export type TextLinkProps = Omit<ComponentProps<"a">, "href"> &
  VariantProps<typeof textLinkStyles> & {
    /** Route, in-page anchor, http(s), mailto: or tel: URL. */
    href: string;
    /** The visible label. */
    children: ReactNode;
    /** Trailing arrow (up and out for external links). */
    arrow?: boolean;
    /** Force new-tab behavior; defaults to true for http(s) URLs. */
    external?: boolean;
    /**
     * Link color.
     * @deprecated Use `emphasis`; `tone` is reserved for band tones. Removed in W3.
     */
    tone?: TextLinkEmphasis;
  };

/**
 * Inline link with an underline that draws in from the left on hover or
 * focus (it simply appears under reduced motion). External links open in a
 * new tab with `rel="noopener noreferrer"` and say so to screen readers.
 */
export function TextLink({
  href,
  children,
  arrow = false,
  external,
  emphasis,
  tone,
  className,
  ...props
}: TextLinkProps) {
  const opensNewTab = external ?? isExternalHref(href);
  const classes = cn(textLinkStyles({ emphasis: emphasis ?? tone }), className);
  const Icon = opensNewTab ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span className="bg-[length:0%_1px] bg-[linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-brand group-hover/link:bg-[length:100%_1px] group-focus-visible/link:bg-[length:100%_1px] motion-reduce:transition-none">
        {children}
      </span>
      {opensNewTab ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
      {arrow ? (
        <Icon
          aria-hidden="true"
          className="size-4 transition-transform duration-500 ease-brand group-hover/link:translate-x-0.5 motion-reduce:transition-none"
        />
      ) : null}
    </>
  );

  if (opensNewTab || isNonRouteHref(href)) {
    return (
      <a
        href={href}
        className={classes}
        target={opensNewTab ? "_blank" : undefined}
        rel={opensNewTab ? "noopener noreferrer" : undefined}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
