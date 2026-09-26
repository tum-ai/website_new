import Image from "next/image";
import { Parallax, Reveal } from "@/components/ds";
import { cn } from "@/lib/cn";

type WidePhotoProps = {
  src: string;
  alt: string;
  /** Aspect-ratio classes; panoramas need a taller crop on small screens. */
  aspectClassName?: string;
  /** object-position for the crop, e.g. "object-[50%_40%]". */
  positionClassName?: string;
  /** Corner radius; match sibling cards when the photo sits in a card grid. */
  radiusClassName?: string;
  sizes?: string;
  className?: string;
};

/**
 * Rounded, container-wide photograph for the apply page's panoramas. The image
 * is slightly oversized and drifts with scroll (static under reduced motion),
 * and eases into a slow zoom on hover.
 */
export function WidePhoto({
  src,
  alt,
  aspectClassName = "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[3/1]",
  positionClassName = "object-center",
  radiusClassName = "rounded-3xl md:rounded-4xl",
  sizes = "(min-width: 80rem) 80rem, 100vw",
  className,
}: WidePhotoProps) {
  return (
    <Reveal variant="scale" className={className}>
      <figure
        className={cn(
          "group/photo relative isolate overflow-hidden bg-sunken",
          radiusClassName,
          aspectClassName,
        )}
      >
        {/* Oversized top and bottom so the drift never shows an edge. */}
        <Parallax offset={14} className="absolute inset-x-0 -inset-y-[8%]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className={cn(
              "object-cover transition-transform duration-[1.4s] ease-brand group-hover/photo:scale-[1.04] motion-reduce:transition-none",
              positionClassName,
            )}
          />
        </Parallax>
      </figure>
    </Reveal>
  );
}
