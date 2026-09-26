import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeadingLevel } from "./types";

/** Props for {@link PersonCard}. */
export type PersonCardProps = {
  /** The person's name (also the default `alt`). */
  name: string;
  /** Line under the name: role or affiliation. */
  byline?: ReactNode;
  /** Portrait, cropped to 4:5. */
  image: { src: string; alt?: string };
  /** A short bio or links under the byline. */
  children?: ReactNode;
  /** Heading level of the name. Default `h3`. */
  headingAs?: HeadingLevel;
  /** next/image `sizes`. */
  sizes?: string;
  /** Classes merged over the `figure`. */
  className?: string;
};

/** Portrait card for members, speakers and alumni. */
export function PersonCard({
  name,
  byline,
  image,
  children,
  headingAs: HeadingTag = "h3",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw",
  className,
}: PersonCardProps) {
  return (
    <figure className={cn("group/zoom", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sunken">
        <Image
          src={image.src}
          alt={image.alt ?? name}
          fill
          sizes={sizes}
          className="zoom-media object-cover"
        />
      </div>
      <figcaption className="mt-4">
        <HeadingTag className="text-fg text-heading-sm">{name}</HeadingTag>
        {byline ? (
          <p className="mt-0.5 text-fg-subtle text-meta">{byline}</p>
        ) : null}
        {children ? (
          <div className="mt-3 text-fg-muted text-small">{children}</div>
        ) : null}
      </figcaption>
    </figure>
  );
}
