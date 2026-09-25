import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type TextLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  children: ReactNode;
  arrow?: boolean;
  /** Muted variant for dense link lists (footer, meta rows). */
  tone?: "accent" | "muted";
};

/**
 * Inline link with an underline that draws in from the left on hover or
 * focus. External links open in a new tab and say so to screen readers.
 */
export function TextLink({
  href,
  children,
  arrow = false,
  tone = "accent",
  className,
  ...props
}: TextLinkProps) {
  const external = /^https?:\/\//.test(href);
  const classes = cn(
    "group/link inline-flex items-center gap-1.5 font-semibold transition-colors duration-300",
    tone === "accent"
      ? "text-highlight hover:text-fg"
      : "text-fg-muted hover:text-fg",
    className,
  );
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-brand group-hover/link:bg-[length:100%_1px] group-focus-visible/link:bg-[length:100%_1px]">
        {children}
      </span>
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      {arrow ? (
        <Icon
          aria-hidden
          className="size-4 transition-transform duration-500 ease-brand group-hover/link:translate-x-0.5"
        />
      ) : null}
    </>
  );

  if (external || /^(mailto:|tel:|#)/.test(href)) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
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
