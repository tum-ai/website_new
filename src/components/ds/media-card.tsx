import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BrandPanel } from "./brand-panel";
import { FallbackImage } from "./fallback-image";
import { isExternalHref } from "./internal";
import type { HeadingLevel } from "./types";

const mediaStyles = cva("relative isolate overflow-hidden bg-sunken", {
  variants: {
    /** Image frame ratio (ignored with `fill`). */
    aspect: {
      "4/5": "aspect-[4/5]",
      "3/4": "aspect-[3/4]",
      "1/1": "aspect-square",
      "4/3": "aspect-[4/3]",
      "16/10": "aspect-[16/10]",
      "16/9": "aspect-video",
    },
    /** `overlay`: text on a scrim over the image. `stacked`: text below. */
    layout: {
      overlay: "",
      stacked: "rounded-3xl",
    },
    /** Fill the parent's height (e.g. a bento cell) instead of using `aspect`. */
    fill: {
      true: "aspect-auto h-full min-h-72",
      false: "",
    },
  },
  defaultVariants: { aspect: "4/5", layout: "overlay", fill: false },
});

const scrimStyles = cva(
  "absolute inset-0 transition-opacity duration-700 ease-brand group-hover/zoom:opacity-95 motion-reduce:transition-none",
  {
    variants: {
      /** Overlay scrim: `strong` keeps copy legible on bright photos. */
      scrim: {
        default:
          "bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent",
        strong:
          "bg-[linear-gradient(to_top,--alpha(var(--color-ink-950)/90%)_0%,--alpha(var(--color-ink-950)/70%)_45%,--alpha(var(--color-ink-950)/25%)_78%,transparent)]",
      },
    },
    defaultVariants: { scrim: "default" },
  },
);

/** The photo of a {@link MediaCard}. */
export type MediaCardImage = {
  /** Image URL. Without one the card shows its `fallback`. */
  src?: string;
  /** Text alternative; "" when the title already says what the photo shows. */
  alt: string;
};

/** Props for {@link MediaCard}. */
export type MediaCardProps = VariantProps<typeof mediaStyles> &
  VariantProps<typeof scrimStyles> & {
    /** The photo. */
    image: MediaCardImage;
    /** The card title; with `href` it is the link's accessible name. */
    title: ReactNode;
    /** Makes the whole card a link (http(s) URLs open in a new tab). */
    href?: string;
    /** Small label above the title. */
    eyebrow?: ReactNode;
    /** A sentence under the title. */
    description?: ReactNode;
    /** Small line under the title (date, metric, location). */
    meta?: ReactNode;
    /**
     * Shown in the image frame when there is no `image.src` or the image fails
     * to load. Default: a <BrandPanel>.
     */
    fallback?: ReactNode;
    /**
     * Top-right corner of the image (decorative). Default: an arrow that
     * turns on hover when the card links; pass `null` for none, or e.g. a
     * <Tag> or an icon.
     */
    cornerHint?: ReactNode;
    /** Heading level of the title. Default `h3`. */
    headingAs?: HeadingLevel;
    /** next/image `sizes`. */
    sizes?: string;
    /** For CMS URLs outside next.config image patterns. */
    unoptimized?: boolean;
    /** Load the image with high priority (the LCP image of a page). */
    priority?: boolean;
    /** Classes merged over the `article`. */
    className?: string;
  };

function DefaultCornerHint() {
  return (
    <span className="grid size-10 place-items-center rounded-full bg-white/90 text-violet-950 shadow-soft backdrop-blur transition-[rotate,background-color] duration-500 ease-brand group-hover/zoom:bg-white motion-safe:group-hover/zoom:rotate-45">
      <ArrowUpRight className="size-4" />
    </span>
  );
}

/**
 * Photo-led card. The whole card is clickable through a stretched title link
 * (so the accessible name is the title) and shows its focus ring around the
 * card; the image eases into the house hover zoom (`zoom-media`) and the
 * corner arrow turns on hover.
 */
export function MediaCard({
  image,
  title,
  href,
  eyebrow,
  description,
  meta,
  fallback,
  cornerHint,
  aspect,
  layout = "overlay",
  headingAs: HeadingTag = "h3",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  unoptimized,
  priority,
  fill = false,
  scrim,
  className,
}: MediaCardProps) {
  const stretchedLink =
    "outline-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit]";
  const titleNode = href ? (
    isExternalHref(href) ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={stretchedLink}
      >
        {title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <Link href={href} className={stretchedLink}>
        {title}
      </Link>
    )
  ) : (
    title
  );
  const hint =
    cornerHint === undefined ? href ? <DefaultCornerHint /> : null : cornerHint;

  const media = (
    <div className={cn(mediaStyles({ aspect, layout, fill }))}>
      <FallbackImage
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        unoptimized={unoptimized}
        priority={priority}
        className="zoom-media object-cover"
        fallback={fallback ?? <BrandPanel />}
      />
      {layout === "overlay" ? (
        <div aria-hidden="true" className={scrimStyles({ scrim })} />
      ) : null}
      {hint ? (
        <span aria-hidden="true" className="absolute top-3 right-3 z-[1]">
          {hint}
        </span>
      ) : null}
    </div>
  );

  if (layout === "stacked") {
    return (
      <article
        className={cn(
          "group/zoom relative rounded-3xl has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-violet-500 has-[a:focus-visible]:outline-offset-4",
          fill && "h-full",
          className,
        )}
      >
        {media}
        <div className="pt-5">
          {eyebrow ? (
            <p className="text-eyebrow text-highlight uppercase">{eyebrow}</p>
          ) : null}
          <HeadingTag className="mt-2 text-fg text-heading-md">
            {titleNode}
          </HeadingTag>
          {meta ? (
            <p className="mt-1 text-fg-subtle text-meta">{meta}</p>
          ) : null}
          {description ? (
            <p className="mt-3 text-fg-muted text-small">{description}</p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      data-tone="night"
      className={cn(
        "group/zoom relative isolate overflow-hidden rounded-4xl bg-transparent",
        "has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-violet-300 has-[a:focus-visible]:outline-offset-4",
        fill && "h-full",
        className,
      )}
    >
      {media}
      <div className="absolute inset-0 z-[1] flex flex-col justify-end rounded-[inherit] p-6 md:p-7">
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
