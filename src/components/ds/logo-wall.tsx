import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FallbackImage } from "./fallback-image";
import { isExternalHref } from "./internal";

/** One organization in a {@link LogoWall} or {@link LogoTile}. */
export type LogoItem = {
  /** Organization name: the fallback text and the default `alt`. */
  name: string;
  /** Logo artwork. Without it (or if it fails to load) the name is set instead. */
  src?: string;
  /** Link to the organization; http(s) URLs open in a new tab. */
  href?: string;
  /** Text alternative for the artwork. Default `name`. */
  alt?: string;
  /**
   * Name set beside a symbol-only logo, forming a wordmark lockup
   * ("[symbol] Y Combinator"). The image then gets an empty `alt`, since the
   * text names the organization.
   */
  wordmark?: ReactNode;
  /**
   * Serve the artwork as is, skipping the image optimizer. Default: true for
   * absolute http(s) URLs (CMS hosts are outside next.config's image
   * patterns), false for local assets.
   */
  unoptimized?: boolean;
};

const logoTileStyles = cva(
  "group/logo inline-flex items-center justify-center bg-white text-violet-950",
  {
    variants: {
      /**
       * `tile`: a white card for logo grids. `chip`: a compact white chip
       * that carries light-background artwork on dark bands (quote rows,
       * meta lines).
       */
      variant: {
        tile: "w-full rounded-2xl ring-1 ring-ink-200/70",
        chip: "h-9 gap-2 rounded-xl px-3",
      },
      /** Tile height and logo cap (the `tile` variant only). */
      size: {
        sm: "",
        md: "",
        lg: "",
      },
      /** Hover tint and violet ring; set for tiles that link. */
      linked: {
        true: "transition-[background-color,box-shadow] duration-300 ease-brand hover:bg-violet-50 hover:ring-2 hover:ring-violet-500 focus-visible:bg-violet-50 motion-reduce:transition-none",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "tile", size: "sm", className: "h-16 px-5" },
      { variant: "tile", size: "md", className: "h-24 px-6" },
      { variant: "tile", size: "lg", className: "h-32 px-8" },
    ],
    defaultVariants: { variant: "tile", size: "md", linked: false },
  },
);

const logoImageStyles = cva(
  "h-auto w-auto max-w-full object-contain mix-blend-multiply",
  {
    variants: {
      variant: { tile: "", chip: "h-5 max-w-28" },
      size: { sm: "", md: "", lg: "" },
      lockup: { true: "", false: "" },
    },
    compoundVariants: [
      { variant: "tile", size: "sm", lockup: false, className: "max-h-7" },
      { variant: "tile", size: "md", lockup: false, className: "max-h-10" },
      { variant: "tile", size: "lg", lockup: false, className: "max-h-14" },
      { variant: "tile", lockup: true, className: "size-9" },
    ],
  },
);

/** Props for {@link LogoTile}. */
export type LogoTileProps = LogoItem &
  VariantProps<typeof logoTileStyles> & {
    /** Load the artwork eagerly, e.g. inside a moving marquee. */
    eager?: boolean;
    /** Classes merged over the tile. */
    className?: string;
  };

/**
 * An organization's logo on white (logos are designed for light
 * backgrounds). With `href` the whole tile is a link: external links open in
 * a new tab and say so. Falls back to the name when there is no artwork or it
 * fails to load; `wordmark` sets a name beside symbol-only artwork.
 */
export function LogoTile({
  name,
  src,
  href,
  alt,
  wordmark,
  unoptimized,
  variant = "tile",
  size = "md",
  eager = false,
  className,
}: LogoTileProps) {
  const lockup = wordmark !== undefined;
  const nameText = (
    <span
      className={cn(
        "font-semibold",
        variant === "chip"
          ? "text-[0.8125rem] tracking-[-0.01em]"
          : lockup
            ? "text-label"
            : "text-center text-heading-sm",
      )}
    >
      {wordmark ?? name}
    </span>
  );
  const content = (
    <>
      <FallbackImage
        src={src}
        alt={lockup ? "" : (alt ?? name)}
        width={200}
        height={80}
        // Remote (CMS) artwork is outside next.config's image patterns.
        unoptimized={unoptimized ?? (src ? isExternalHref(src) : false)}
        loading={eager ? "eager" : "lazy"}
        className={cn(logoImageStyles({ variant, size, lockup }))}
        fallback={lockup ? null : nameText}
      />
      {lockup ? nameText : null}
    </>
  );
  const classes = cn(
    logoTileStyles({ variant, size, linked: Boolean(href) }),
    lockup && "gap-2.5",
    className,
  );

  if (!href) return <span className={classes}>{content}</span>;

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

const logoWallStyles = cva("grid gap-3", {
  variants: {
    /** Columns on wide screens; phones always show two. */
    columns: {
      3: "grid-cols-2 sm:grid-cols-3",
      4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
      6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    },
  },
  defaultVariants: { columns: 4 },
});

/** Props for {@link LogoWall}. */
export type LogoWallProps = VariantProps<typeof logoWallStyles> & {
  /** The organizations; `name` must be unique (it is the list key). */
  logos: LogoItem[];
  /** Tile size for every logo. */
  size?: LogoTileProps["size"];
  /** Accessible name of the list, e.g. "Research collaborators". */
  label?: string;
  /** Classes merged over the list. */
  className?: string;
};

/** A grid of logo tiles, as a list. */
export function LogoWall({
  logos,
  columns,
  size = "md",
  label,
  className,
}: LogoWallProps) {
  return (
    <ul
      aria-label={label}
      className={cn(logoWallStyles({ columns }), className)}
    >
      {logos.map((logo) => (
        <li key={logo.name} className="flex">
          <LogoTile {...logo} size={size} />
        </li>
      ))}
    </ul>
  );
}
