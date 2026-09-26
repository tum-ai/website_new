import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PersonCardProps = {
  name: string;
  role?: ReactNode;
  image: { src: string; alt?: string };
  children?: ReactNode;
  headingAs?: "h3" | "h4";
  sizes?: string;
  className?: string;
};

/** Portrait card for members, speakers and alumni. */
export function PersonCard({
  name,
  role,
  image,
  children,
  headingAs: HeadingTag = "h3",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw",
  className,
}: PersonCardProps) {
  return (
    <figure className={cn("group/person", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sunken">
        <Image
          src={image.src}
          alt={image.alt ?? name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/person:scale-[1.04] motion-reduce:transition-none"
        />
      </div>
      <figcaption className="mt-4">
        <HeadingTag className="text-fg text-heading-sm">{name}</HeadingTag>
        {role ? (
          <p className="mt-0.5 text-fg-subtle text-meta">{role}</p>
        ) : null}
        {children ? (
          <div className="mt-3 text-fg-muted text-small">{children}</div>
        ) : null}
      </figcaption>
    </figure>
  );
}
