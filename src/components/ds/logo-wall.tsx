import { cn } from "@/lib/utils";

export type LogoItem = {
  name: string;
  src?: string;
  href?: string;
  alt?: string;
};

type LogoTileProps = LogoItem & {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const tileSizes = {
  sm: "h-16 px-5 [&_img]:max-h-7",
  md: "h-24 px-6 [&_img]:max-h-10",
  lg: "h-32 px-8 [&_img]:max-h-14",
} as const;

/**
 * White logo tile (logos are designed for light backgrounds). Hover tints it
 * lavender and rings it in brand violet, matching the partner page. Falls
 * back to the company name when no artwork exists.
 */
export function LogoTile({
  name,
  src,
  href,
  alt,
  size = "md",
  className,
}: LogoTileProps) {
  const classes = cn(
    "group/logo grid w-full place-items-center rounded-2xl bg-white ring-1 ring-ink-200/70 transition-[background-color,box-shadow] duration-300 ease-brand",
    href && "hover:bg-violet-50 hover:ring-2 hover:ring-violet-500",
    tileSizes[size],
    className,
  );
  const content = src ? (
    <img
      src={src}
      alt={alt ?? name}
      loading="lazy"
      decoding="async"
      className="h-auto w-auto max-w-full object-contain mix-blend-multiply"
    />
  ) : (
    <span className="text-heading-sm text-violet-950">{name}</span>
  );

  if (!href) return <div className={classes}>{content}</div>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      aria-label={`${name} (opens in a new tab)`}
    >
      {content}
    </a>
  );
}

const columnClasses = {
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
} as const;

export function LogoWall({
  logos,
  columns = 4,
  size = "md",
  className,
}: {
  logos: LogoItem[];
  columns?: keyof typeof columnClasses;
  size?: LogoTileProps["size"];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3", columnClasses[columns], className)}>
      {logos.map((logo) => (
        <li key={logo.name}>
          <LogoTile {...logo} size={size} />
        </li>
      ))}
    </ul>
  );
}
