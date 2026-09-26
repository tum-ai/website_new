import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const pillStyles = cva(
  "inline-flex items-center rounded-full border-[1.5px] border-violet-500 font-medium text-fg",
  {
    variants: {
      /** Size step; `lg` is a statement label ("Mission"). */
      size: {
        sm: "px-3 py-1 text-meta",
        md: "px-4 py-1.5 text-small",
        lg: "px-6 py-2 text-heading-md",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** Props for {@link Pill}. */
export type PillProps = ComponentProps<"span"> &
  VariantProps<typeof pillStyles>;

/** Outlined violet pill from the brand guide ("Mission", "Vision"). */
export function Pill({ className, size, ...props }: PillProps) {
  return <span className={cn(pillStyles({ size }), className)} {...props} />;
}

/** Props for {@link Tag}: a span's props. */
export type TagProps = ComponentProps<"span">;

/** Small filled chip for keywords, categories and counts. */
export function Tag({ className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-fg/[0.07] px-3 py-1 font-medium text-fg-muted text-meta",
        className,
      )}
      {...props}
    />
  );
}

/*
 * Minimum heights match Button heights. The radius is half the one-line
 * height, so a label too long for a narrow phone wraps into a rounded
 * rectangle instead of overflowing its row.
 */
const statusBadgeStyles = cva(
  "inline-flex items-center justify-center text-balance border text-center font-semibold leading-snug backdrop-blur",
  {
    variants: {
      /**
       * `live` pulses (applications open), `idle` is static (upcoming,
       * paused), `closed` is muted with a hollow dot (applications closed).
       */
      status: {
        live: "border-hairline-strong bg-fg/[0.04] text-fg",
        idle: "border-hairline-strong bg-fg/[0.04] text-fg",
        closed: "border-hairline bg-transparent text-fg-muted",
      },
      /**
       * Matches Button heights (default `md` like Button) so badges sit flush
       * beside buttons. Always use the size of the neighbouring button.
       */
      size: {
        // 13px without text-meta's line height, like the small Button.
        sm: "min-h-9 rounded-[1.125rem] py-1.5 pr-4 pl-3 text-[0.8125rem]",
        md: "min-h-11 rounded-[1.375rem] py-2 pr-5 pl-4 text-label",
        lg: "min-h-13 rounded-[1.625rem] py-2.5 pr-6 pl-5 text-base",
      },
    },
    defaultVariants: { status: "live", size: "md" },
  },
);

const dotStyles = cva("relative size-2 rounded-full", {
  variants: {
    status: {
      live: "bg-violet-400",
      idle: "bg-fg-subtle",
      closed: "border-[1.5px] border-fg-subtle",
    },
  },
  defaultVariants: { status: "live" },
});

/** The states a {@link StatusBadge} can show. */
export type BadgeStatus = NonNullable<
  VariantProps<typeof statusBadgeStyles>["status"]
>;

/** Props for {@link StatusBadge}. */
export type StatusBadgeProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof statusBadgeStyles> & {
    /** The status line, e.g. "Applications open until 26.09.2026". */
    children: ReactNode;
  };

/**
 * Status line with a dot. The dot is decorative, so the label has to say the
 * state in words ("Applications closed"), not only the color.
 */
export function StatusBadge({
  status = "live",
  size,
  children,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-status={status}
      className={cn(statusBadgeStyles({ status, size }), className)}
      {...props}
    >
      {/* One text run with an inline dot: a wrapped label stays centred and
          the dot travels with its first line. */}
      <span>
        <span
          aria-hidden="true"
          className="relative mr-2.5 inline-flex size-2 align-middle"
        >
          {status === "live" ? (
            <span className="absolute inset-0 rounded-full bg-violet-400 motion-safe:animate-pulse-ring" />
          ) : null}
          <span className={dotStyles({ status })} />
        </span>
        {children}
      </span>
    </span>
  );
}
