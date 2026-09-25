"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ds";
import { BrandPlaceholder } from "@/features/research";
import { cn } from "@/lib/cn";

interface ProjectCardProps {
  name: string;
  description: string;
  image: string;
  detailedDescription: string;
  /** Position in the grid: drives the "01" counter and the placeholder art. */
  index?: number;
  /** Shape of the tile; the grid decides it (default 4:5). */
  className?: string;
  /** next/image `sizes` for the tile photo. */
  sizes?: string;
}

/**
 * Task force tile: photo (or a branded ink placeholder) with the name on a
 * scrim. On hover or keyboard focus the detailed description rises in; the
 * whole tile is one dialog trigger, labelled by the name.
 */
export function ProjectCard({
  name,
  description,
  image,
  detailedDescription,
  index = 0,
  className,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
}: ProjectCardProps) {
  const [imageUnavailable, setImageUnavailable] = useState(!image);
  const titleId = useId();
  const number = String(index + 1).padStart(2, "0");

  const renderMedia = (imageSizes: string) =>
    imageUnavailable ? (
      <BrandPlaceholder seed={index} />
    ) : (
      <Image
        src={image}
        alt={`${name} task force`}
        fill
        sizes={imageSizes}
        onError={() => setImageUnavailable(true)}
        className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/media:scale-[1.045] motion-reduce:transition-none"
      />
    );

  return (
    <Dialog>
      <article
        className={cn(
          "group/media relative isolate aspect-[4/5] rounded-4xl bg-violet-950 text-white shadow-soft",
          "transition-[translate,box-shadow] duration-500 ease-brand hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          className,
        )}
      >
        {/* Only the imagery is clipped, so the trigger's focus ring can sit
            outside the tile like every other focus ring on the site. */}
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          {renderMedia(sizes)}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-ink-950/10"
          />
          {imageUnavailable ? null : (
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink-950/45 to-transparent"
            />
          )}
          {/* Veil that darkens the tile so the detailed description reads. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-ink-950/80 opacity-0 backdrop-blur-[3px] transition-opacity duration-500 ease-brand group-hover/media:opacity-100 group-has-[:focus-visible]/media:opacity-100 motion-reduce:transition-none"
          />
        </div>
        {/* The disc sits 12px from the 32px corner (20px radius), so it is
            concentric; the counter lines up with the title's left edge. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-3 flex items-center justify-between pr-3 pl-6 md:pl-7"
        >
          <span className="tabular text-eyebrow font-semibold text-white/75">
            {number}
          </span>
          <span className="grid size-10 place-items-center rounded-full bg-white/90 text-violet-950 shadow-soft backdrop-blur transition-[rotate,background-color] duration-500 ease-brand group-hover/media:rotate-90 group-hover/media:bg-white motion-reduce:transition-none">
            <Plus className="size-4" />
          </span>
        </div>
        {/* Visual preview only: the dialog carries the same text for everyone. */}
        <p
          aria-hidden
          className="absolute inset-x-0 top-20 translate-y-3 px-6 text-small text-white/90 opacity-0 transition-[opacity,translate] duration-500 ease-brand group-hover/media:translate-y-0 group-hover/media:opacity-100 group-has-[:focus-visible]/media:translate-y-0 group-has-[:focus-visible]/media:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none md:top-22 md:px-7"
        >
          {detailedDescription}
        </p>
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
          <h3 id={titleId} className="text-heading-lg text-white">
            {name}
          </h3>
          <p className="mt-2 line-clamp-3 max-w-md text-small text-white/80 md:min-h-[4.95em] transition-opacity duration-300 ease-brand group-hover/media:opacity-0 group-has-[:focus-visible]/media:opacity-0">
            {description}
          </p>
        </div>
        <DialogTrigger
          aria-labelledby={titleId}
          className="absolute inset-0 z-10 rounded-[inherit]"
        />
      </article>

      <DialogContent size="lg">
        <div
          data-tone="night"
          className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]"
        >
          {renderMedia("(min-width: 800px) 768px, 100vw")}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10">
            <p className="text-eyebrow text-violet-200 uppercase">
              Task force {number}
            </p>
            <DialogTitle className="mt-3 text-display-md text-white">
              {name}
            </DialogTitle>
          </div>
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          <DialogDescription className="text-lead text-fg">
            {description}
          </DialogDescription>
          <div className="mt-8 grid gap-3 border-t border-hairline pt-8 md:grid-cols-[8rem_minmax(0,1fr)] md:items-baseline md:gap-8">
            <h3 className="text-eyebrow text-fg-subtle uppercase">About</h3>
            <p className="text-body leading-relaxed text-fg-muted">
              {detailedDescription}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
