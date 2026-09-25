import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const aspects = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/10": "aspect-[16/10]",
  "16/9": "aspect-video",
} as const;

type MediaCardProps = {
  image: { src: string; alt: string };
  title: ReactNode;
  href?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Small line under the title (date, metric, location). */
  meta?: ReactNode;
  aspect?: keyof typeof aspects;
  /** `overlay`: text on a scrim over the image. `stacked`: text below. */
  layout?: "overlay" | "stacked";
  headingAs?: "h2" | "h3" | "h4";
  /** next/image `sizes`. */
  sizes?: string;
  /** For CMS URLs outside next.config image patterns. */
  unoptimized?: boolean;
  className?: string;
};

/**
 * Photo-led card. The whole card is clickable through a stretched title link
 * (so the accessible name is the title); the image eases into a slow zoom and
 * the corner arrow turns on hover.
 */
export function MediaCard({
  image,
  title,
  href,
  eyebrow,
  description,
  meta,
  aspect = "4/5",
  layout = "overlay",
  headingAs: HeadingTag = "h3",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  unoptimized,
  className,
}: MediaCardProps) {
  const external = href ? /^https?:\/\//.test(href) : false;
  const titleNode = href ? (
    external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] focus-visible:after:outline-3 focus-visible:after:outline-violet-300 focus-visible:after:outline-offset-4"
      >
        {title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <Link
        href={href}
        className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] focus-visible:after:outline-3 focus-visible:after:outline-violet-500 focus-visible:after:outline-offset-4"
      >
        {title}
      </Link>
    )
  ) : (
    title
  );

  const media = (
    <div
      className={cn(
        "relative overflow-hidden bg-sunken",
        aspects[aspect],
        layout === "stacked" && "rounded-3xl",
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        unoptimized={unoptimized}
        className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/media:scale-[1.045] motion-reduce:transition-none"
      />
      {layout === "overlay" ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent transition-opacity duration-700 ease-brand group-hover/media:opacity-95"
        />
      ) : null}
      {href ? (
        <span
          aria-hidden
          className="absolute top-4 right-4 z-[1] grid size-10 place-items-center rounded-full bg-white/90 text-violet-950 shadow-soft backdrop-blur transition-[rotate,background-color] duration-500 ease-brand group-hover/media:rotate-45 group-hover/media:bg-white"
        >
          <ArrowUpRight className="size-4" />
        </span>
      ) : null}
    </div>
  );

  if (layout === "stacked") {
    return (
      <article className={cn("group/media relative", className)}>
        {media}
        <div className="pt-5">
          {eyebrow ? (
            <p className="text-eyebrow text-highlight uppercase">{eyebrow}</p>
          ) : null}
          <HeadingTag className="mt-2 text-heading-md text-fg">
            {titleNode}
          </HeadingTag>
          {meta ? (
            <p className="mt-1 text-meta text-fg-subtle">{meta}</p>
          ) : null}
          {description ? (
            <p className="mt-3 text-small text-fg-muted">{description}</p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      data-tone="night"
      className={cn(
        "group/media relative isolate overflow-hidden rounded-4xl bg-transparent",
        className,
      )}
    >
      {media}
      <div className="absolute inset-x-0 bottom-0 z-[1] p-6 md:p-7">
        {eyebrow ? (
          <p className="text-eyebrow text-violet-200 uppercase">{eyebrow}</p>
        ) : null}
        <HeadingTag className="mt-2 text-heading-lg text-white">
          {titleNode}
        </HeadingTag>
        {meta ? <p className="mt-1.5 text-meta text-white/70">{meta}</p> : null}
        {description ? (
          <p className="mt-3 max-w-md text-small text-white/80">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
