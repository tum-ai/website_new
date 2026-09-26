import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Polymorphic<T extends ElementType, P = object> = P & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | keyof P>;

const displaySizes = {
  "2xl": "text-display-2xl",
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
} as const;

/** Large editorial headline. Visual size is independent of the heading level. */
export function Display<T extends ElementType = "h2">({
  as,
  size = "lg",
  className,
  ...props
}: Polymorphic<T, { size?: keyof typeof displaySizes }>) {
  const Component = as ?? "h2";
  return (
    <Component
      className={cn(displaySizes[size], "text-fg", className)}
      {...props}
    />
  );
}

const headingSizes = {
  lg: "text-heading-lg",
  md: "text-heading-md",
  sm: "text-heading-sm",
} as const;

export function Heading<T extends ElementType = "h3">({
  as,
  size = "md",
  className,
  ...props
}: Polymorphic<T, { size?: keyof typeof headingSizes }>) {
  const Component = as ?? "h3";
  return (
    <Component
      className={cn(headingSizes[size], "text-fg", className)}
      {...props}
    />
  );
}

const textSizes = {
  lead: "text-lead",
  body: "text-body",
  small: "text-small",
  meta: "text-meta",
} as const;

const textTones = {
  default: "text-fg",
  muted: "text-fg-muted",
  subtle: "text-fg-subtle",
} as const;

export function Text<T extends ElementType = "p">({
  as,
  size = "body",
  tone = "muted",
  className,
  ...props
}: Polymorphic<
  T,
  { size?: keyof typeof textSizes; tone?: keyof typeof textTones }
>) {
  const Component = as ?? "p";
  return (
    <Component
      className={cn(textSizes[size], textTones[tone], className)}
      {...props}
    />
  );
}

/**
 * Small uppercase label above headlines. `index` renders an editorial counter
 * ("01") separated by a short rule, as in the brand guide.
 */
export function Eyebrow<T extends ElementType = "p">({
  as,
  index,
  className,
  children,
  ...props
}: Polymorphic<T, { index?: string | number; children: ReactNode }>) {
  const Component = as ?? "p";
  return (
    <Component
      className={cn(
        "inline-flex items-center gap-3 text-eyebrow text-highlight uppercase",
        className,
      )}
      {...props}
    >
      {index !== undefined ? (
        <>
          <span className="tabular text-fg-subtle">
            {typeof index === "number" ? String(index).padStart(2, "0") : index}
          </span>
          <span aria-hidden className="h-px w-6 bg-current opacity-50" />
        </>
      ) : null}
      <span>{children}</span>
    </Component>
  );
}

/**
 * Emphasis inside a headline. `fade` renders the Electric Fade gradient;
 * `accent` uses the tone's accessible accent color.
 */
export function Highlight({
  variant = "accent",
  className,
  ...props
}: ComponentPropsWithoutRef<"span"> & { variant?: "accent" | "fade" }) {
  return (
    <span
      className={cn(
        variant === "fade" ? "text-gradient-brand" : "text-highlight",
        className,
      )}
      {...props}
    />
  );
}

/** Long-form content (legal pages, rich descriptions) with brand typography. */
export function Prose({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "prose max-w-none text-body",
        "prose-headings:font-semibold prose-headings:text-fg prose-headings:tracking-tight",
        "prose-h2:mt-14 prose-h2:text-heading-lg prose-h3:text-heading-md",
        "prose-li:text-fg-muted prose-p:text-fg-muted prose-strong:text-fg",
        "prose-a:font-medium prose-a:text-highlight prose-a:decoration-1 prose-a:underline-offset-4 hover:prose-a:decoration-2",
        "prose-hr:border-hairline prose-li:marker:text-highlight",
        className,
      )}
      {...props}
    />
  );
}
