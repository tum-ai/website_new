import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Button styles, shared by <Button> (actions) and <ButtonLink> (navigation).
 *
 * Primary uses violet-600 (#8052C2) at rest so white labels meet WCAG AA
 * (5.4:1), and the brand's dark purple (#523573) on hover. Secondary, outline
 * and ghost read the surrounding tone, so they work on light and dark bands.
 */
export const buttonStyles = cva(
  [
    "group/button relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden",
    "whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] select-none",
    "transition-[background-color,color,border-color,box-shadow,scale] duration-300 ease-brand",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-45 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-violet-600 text-white",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_10px_28px_-12px_rgb(154_100_217/0.9)]",
          "hover:bg-violet-800 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_14px_36px_-14px_rgb(82_53_115/0.95)]",
          // Sheen that sweeps across once per hover.
          "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-1/2",
          "before:-translate-x-full before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent",
          "motion-safe:before:transition-transform motion-safe:before:duration-700 motion-safe:before:ease-brand motion-safe:hover:before:translate-x-[260%]",
        ],
        secondary: "bg-fg/[0.07] text-fg hover:bg-fg/[0.12]",
        outline:
          "border border-fg/25 text-fg hover:border-fg/60 hover:bg-fg/[0.04]",
        ghost: "text-fg hover:bg-fg/[0.07]",
        /** Solid white; for secondary actions on dark bands and photos. */
        inverse:
          "bg-white text-violet-950 shadow-[0_10px_30px_-14px_rgb(13_2_20/0.6)] hover:bg-violet-50",
        link: "h-auto rounded-none px-0 text-highlight underline-offset-[6px] decoration-1 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem]",
        md: "h-11 px-5.5 text-[0.9375rem]",
        lg: "h-13 px-7 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    compoundVariants: [
      // Text-height links get a finger-sized hit area; the negative margin
      // keeps their layout box unchanged.
      { variant: "link", className: "-my-3 h-auto px-0 py-3" },
    ],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonStyles>;

type ArrowKind = boolean | "right" | "external" | "down";

function ButtonArrow({ kind }: { kind: Exclude<ArrowKind, false> }) {
  const base =
    "size-4 transition-transform duration-500 ease-brand motion-reduce:transition-none";
  if (kind === "external") {
    return (
      <ArrowUpRight
        aria-hidden
        className={cn(
          base,
          "group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5",
        )}
      />
    );
  }
  if (kind === "down") {
    return (
      <ArrowDown
        aria-hidden
        className={cn(base, "group-hover/button:translate-y-0.5")}
      />
    );
  }
  return (
    <ArrowRight
      aria-hidden
      className={cn(base, "group-hover/button:translate-x-1")}
    />
  );
}

type ButtonProps = BaseButton.Props &
  ButtonStyleProps & {
    /** Trailing arrow that nudges on hover. */
    arrow?: ArrowKind;
    className?: string;
  };

/**
 * Action button (Base UI): keyboard, focus and disabled semantics come from
 * the primitive. For navigation use <ButtonLink>.
 */
export function Button({
  variant,
  size,
  arrow,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    >
      {children}
      {arrow ? <ButtonArrow kind={arrow} /> : null}
    </BaseButton>
  );
}

type ButtonLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> &
  ButtonStyleProps & {
    href: string;
    arrow?: ArrowKind;
    /** Force new-tab behavior; defaults to true for http(s) URLs. */
    external?: boolean;
    children: ReactNode;
  };

const isExternalHref = (href: string) => /^https?:\/\//.test(href);
const isNonRouteHref = (href: string) => /^(https?:|mailto:|tel:|#)/.test(href);

/**
 * Link styled as a button. Internal routes use next/link; external links open
 * in a new tab with `rel="noopener noreferrer"` and an announced hint.
 */
export function ButtonLink({
  href,
  variant,
  size,
  arrow,
  external,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const opensNewTab = external ?? isExternalHref(href);
  const classes = cn(buttonStyles({ variant, size }), className);
  const content = (
    <>
      {children}
      {opensNewTab ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
      {arrow ? <ButtonArrow kind={arrow} /> : null}
    </>
  );

  if (isNonRouteHref(href) || opensNewTab) {
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

type IconButtonProps = Omit<ButtonProps, "arrow" | "size"> & {
  "aria-label": string;
  size?: "icon" | "icon-sm";
};

/** Icon-only action. An accessible label is required. */
export function IconButton({
  size = "icon",
  variant = "secondary",
  ...props
}: IconButtonProps) {
  return <Button size={size} variant={variant} {...props} />;
}
