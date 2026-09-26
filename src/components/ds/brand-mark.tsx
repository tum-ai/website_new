import { cva } from "class-variance-authority";
import { type ComponentProps, useId } from "react";
import { cn } from "@/lib/cn";

const brandMarkStyles = cva("pointer-events-none select-none", {
  variants: {
    drift: {
      true: "motion-safe:animate-drift",
      false: "",
    },
  },
  defaultVariants: { drift: true },
});

/** Props for {@link BrandMark}. */
export type BrandMarkProps = Omit<
  ComponentProps<"svg">,
  "children" | "viewBox" | "fill"
> & {
  /** `tonal`: one currentColor fill. `gradient`: violet fade on the center stroke. */
  variant?: "tonal" | "gradient";
  /** Slow ambient drift (still under reduced motion). Default true. */
  drift?: boolean;
};

/**
 * The official TUM.ai logomark geometry (paths from
 * public/assets/tum_ai_logo_new.svg), used as a large tonal background shape
 * exactly as the 2026 brand guide does on its section slides. It is
 * decoration only (hidden from assistive technology): never recolor it into
 * a logo substitute or place it where the real logo belongs. Size and place
 * it with `className`, and color it with a text color.
 */
export function BrandMark({
  className,
  variant = "tonal",
  drift,
  ...props
}: BrandMarkProps) {
  // Unique per instance: a shared id breaks when the first instance is hidden.
  const gradientId = `brand-mark-fade-${useId().replace(/:/g, "")}`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 477 406"
      className={cn(brandMarkStyles({ drift }), className)}
      fill="currentColor"
      {...props}
    >
      {variant === "gradient" ? (
        <defs>
          {/* The official logo's gradient stops. */}
          <linearGradient
            id={gradientId}
            x1="153.72"
            y1="180.59"
            x2="448.91"
            y2="291.39"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset=".05" stopColor="#3D2175" />
            <stop offset=".35" stopColor="#9B6BEA" />
            <stop offset="1" stopColor="#AC78FF" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        fill={variant === "gradient" ? `url(#${gradientId})` : undefined}
        d="M353.29 366.1c0 3.49-.45 6.88-1.29 10.11-.9 3.45-2.25 6.72-3.99 9.74v.02c-6.32 10.97-17.7 18.65-30.95 19.84-.6.06-1.2.1-1.81.13h-3.64c-.61-.03-1.21-.07-1.81-.13-13.06-1.18-24.3-8.65-30.67-19.36l-4.3-10.31-65.72-157.63-5.89-14.12c-6.08-8.47-15.94-13.99-27.09-13.99s-21.12 5.56-27.18 14.11l26.94-65.68 26.29-64.08 14.72-35.89.97-2.37 128.39 306.98 6.35 15.19c.45 2.41.69 4.9.69 7.44Z"
      />
      <path d="M217.86 36.49l-.97 2.37-14.72 35.89-26.29 64.08-26.94 65.68-5.85 14.25-64.64 157.58-3.99 9.74-.01.02c-6.32 10.97-17.7 18.65-30.95 19.84h-7.26C15.92 404.11 0 387.03 0 366.23c0-4.28.68-8.41 1.93-12.28l2.32-5.64L132.85 35.65l3.46-8.4.81-1.96c.26-.62.55-1.23.85-1.83C144.84 9.67 158.97.21 175.28.21c14.13 0 26.61 7.1 34.17 17.96.08.1.15.2.21.3.73 1.07 1.41 2.17 2.04 3.3 1.5 2.69 2.71 5.57 3.6 8.59l2.56 6.13Z" />
      <path d="M476.36 365.87c0 3.49-.45 6.88-1.29 10.11-.9 3.45-2.25 6.72-3.99 9.74l-.01.02c-6.32 10.97-17.7 18.65-30.95 19.84-.6.06-1.2.1-1.81.13h-3.64c-.61-.03-1.21-.07-1.81-.13-13.06-1.18-24.3-8.65-30.67-19.36l-4.3-10.31L266.92 61.79l-5.71-13.68c-.56-2.66-.85-5.41-.85-8.24 0-4.28.68-8.41 1.93-12.28.63-1.95 1.4-3.83 2.32-5.64C271.17 8.93 284.66 0 300.23 0c13.49 0 25.41 6.7 32.63 16.96l6.61 15.8 129.85 310.48 6.35 15.19c.45 2.41.69 4.9.69 7.44Z" />
    </svg>
  );
}
