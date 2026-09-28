import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight, Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Anchor } from "./anchor";
import { BrandPanel } from "./brand-panel";
import { FallbackImage } from "./fallback-image";
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

const descriptionStyles = cva("", {
  variants: {
    /**
     * Clamp the description to this many lines and, from `md` (grids of two
     * or more columns), reserve their height, so the titles of a row share a
     * baseline however long each description is.
     */
    descriptionLines: {
      2: "line-clamp-2 md:min-h-[2lh]",
      3: "line-clamp-3 md:min-h-[3lh]",
    },
  },
});

const cornerHintStyles = cva(
  "grid size-10 shrink-0 place-items-center rounded-full transition-[rotate,background-color] duration-500 ease-brand motion-reduce:transition-none",
  {
    variants: {
      /** What a click does: `arrow` goes somewhere, `open` opens a dialog. */
      icon: {
        arrow: "motion-safe:group-hover/zoom:rotate-45",
        open: "motion-safe:group-hover/zoom:rotate-90",
      },
      /** `media`: a white disc over photos. `tonal`: on the card surface. */
      variant: {
        media:
          "bg-white/90 text-violet-950 shadow-soft backdrop-blur group-hover/zoom:bg-white",
        tonal: "bg-fg/[0.07] text-fg group-hover/zoom:bg-fg/[0.12]",
      },
    },
    defaultVariants: { icon: "arrow", variant: "media" },
  },
);

/** Props for {@link CornerHint}. */
export type CornerHintProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof cornerHintStyles>;

/**
 * The disc in a card's corner that says what a click does: an arrow that
 * turns on hover (a link) or a plus that turns into a cross (a dialog). It
 * reacts to the nearest `group/zoom` and is decorative (hidden from AT).
 * <MediaCard> shows one by default; place it yourself in other cards, sized
 * with `className` (default `size-10`).
 */
export function CornerHint({
  icon,
  variant,
  className,
  ...props
}: CornerHintProps) {
  const Icon = icon === "open" ? Plus : ArrowUpRight;
  return (
    <span
      aria-hidden="true"
      className={cn(cornerHintStyles({ icon, variant }), className)}
      {...props}
    >
      <Icon className="size-4" />
    </span>
  );
}

/** The photo of a {@link MediaCard}. */
export type MediaCardImage = {
  /** Image URL. Without one the card shows its `fallback`. */
  src?: string;
  /** Text alternative; "" when the title already says what the photo shows. */
  alt: string;
};

/** Props for {@link MediaCard}. */
export type MediaCardProps = VariantProps<typeof mediaStyles> &
  VariantProps<typeof scrimStyles> &
  VariantProps<typeof descriptionStyles> & {
    /** The photo. */
    image: MediaCardImage;
    /** The card title; with `href` it is the link's accessible name. */
    title: ReactNode;
    /** id of the title heading, e.g. for an `action`'s `aria-labelledby`. */
    titleId?: string;
    /** Makes the whole card a link (http(s) URLs open in a new tab). */
    href?: string;
    /**
     * Makes the whole card one control instead of a link: an interactive
     * element, typically a Base UI trigger such as
     * `<DialogTrigger aria-labelledby={titleId} />`, stretched over the card.
     * Name it (e.g. by the title, through `titleId`); the card draws its
     * focus ring. Use it instead of `href`, not with it.
     */
    action?: ReactNode;
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
     * Top-right corner of the image (decorative). Default: a <CornerHint>
     * arrow when the card links, a <CornerHint icon="open"> plus when it has
     * an `action`; pass `null` for none, or e.g. a <Tag> or an icon.
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

/**
 * Photo-led card. The whole card is clickable, through a stretched title
 * link (`href`, so the accessible name is the title) or a stretched `action`
 * such as a dialog trigger, and shows its focus ring around the card. The
 * image eases into the house hover zoom (`zoom-media`) and the corner hint
 * turns on hover.
 */
export function MediaCard({
  image,
  title,
  titleId,
  href,
  action,
  eyebrow,
  description,
  descriptionLines,
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
  const titleNode = href ? (
    <Anchor
      href={href}
      className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit]"
    >
      {title}
    </Anchor>
  ) : (
    title
  );
  const defaultHint = href ? (
    <CornerHint />
  ) : action ? (
    <CornerHint icon="open" />
  ) : null;
  const hint = cornerHint === undefined ? defaultHint : cornerHint;
  // The wrapper stretches the caller's control over the card; the card
  // draws the focus ring, so the control's own (clipped) ring is dropped.
  const stretchedAction = action ? (
    <div
      data-card-action=""
      className="absolute inset-0 z-10 rounded-[inherit] *:absolute *:inset-0 *:rounded-[inherit] *:outline-none"
    >
      {action}
    </div>
  ) : null;
  const descriptionClassName = descriptionStyles({ descriptionLines });

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
          "group/zoom relative rounded-3xl",
          // The ring shows while the stretched title link or action has
          // keyboard focus; the card draws it, since theirs would be clipped.
          "has-[a:focus-visible,[data-card-action]>:focus-visible]:outline-3 has-[a:focus-visible,[data-card-action]>:focus-visible]:outline-violet-500 has-[a:focus-visible,[data-card-action]>:focus-visible]:outline-offset-4",
          fill && "h-full",
          className,
        )}
      >
        {media}
        <div className="pt-5">
          {eyebrow ? (
            <p className="text-eyebrow text-highlight uppercase">{eyebrow}</p>
          ) : null}
          <HeadingTag id={titleId} className="mt-2 text-fg text-heading-md">
            {titleNode}
          </HeadingTag>
          {meta ? (
            <p className="mt-1 text-fg-subtle text-meta">{meta}</p>
          ) : null}
          {description ? (
            <p
              className={cn(
                "mt-3 text-fg-muted text-small",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {stretchedAction}
      </article>
    );
  }

  return (
    <article
      data-tone="night"
      className={cn(
        "group/zoom relative isolate overflow-hidden rounded-4xl bg-transparent",
        "has-[a:focus-visible,[data-card-action]>:focus-visible]:outline-3 has-[a:focus-visible,[data-card-action]>:focus-visible]:outline-violet-300 has-[a:focus-visible,[data-card-action]>:focus-visible]:outline-offset-4",
        fill && "h-full",
        className,
      )}
    >
      {media}
      <div className="absolute inset-0 z-[1] flex flex-col justify-end rounded-[inherit] p-6 md:p-7">
        {eyebrow ? (
          <p className="text-eyebrow text-violet-200 uppercase">{eyebrow}</p>
        ) : null}
        <HeadingTag id={titleId} className="mt-2 text-heading-lg text-white">
          {titleNode}
        </HeadingTag>
        {meta ? <p className="mt-1.5 text-meta text-white/70">{meta}</p> : null}
        {description ? (
          <p
            className={cn(
              "mt-3 max-w-md text-small text-white/80",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {stretchedAction}
    </article>
  );
}
