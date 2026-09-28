import {
  BrandPanel,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  FallbackImage,
  MediaCard,
} from "@/components/ds";
import { cn } from "@/lib/cn";
import type { Project } from "./data/projects";

type ProjectCardProps = {
  /** The task force. */
  project: Project;
  /** Position in the grid: drives the "01" counter and the brand panel art. */
  index: number;
  /** Shape of the tile (aspect classes); the grid decides it. Default 4:5. */
  className?: string;
  /** next/image `sizes` for the tile photo. */
  sizes?: string;
};

/**
 * Task force tile: a MediaCard (photo, or a brand panel without one) with the
 * name on a scrim. The whole tile is one dialog trigger (the card's
 * `action`), labelled by the name, that opens the detailed description. A
 * server component: the ds Dialog and the image fallback are the only client
 * parts.
 */
export function ProjectCard({
  project,
  index,
  className,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
}: ProjectCardProps) {
  const { name, description, detailedDescription, image } = project;
  const titleId = `task-force-${index + 1}-title`;
  const number = String(index + 1).padStart(2, "0");
  const alt = `${name} task force`;

  return (
    <Dialog>
      <MediaCard
        fill
        className={cn("aspect-4/5", className)}
        image={{ src: image, alt }}
        fallback={<BrandPanel seed={index} />}
        eyebrow={<span aria-hidden="true">{number}</span>}
        title={name}
        titleId={titleId}
        description={description}
        descriptionLines={3}
        action={<DialogTrigger aria-labelledby={titleId} />}
        sizes={sizes}
      />

      <DialogContent size="lg">
        <div
          data-tone="night"
          className="relative aspect-[4/3] overflow-hidden sm:aspect-video"
        >
          <FallbackImage
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 800px) 768px, 100vw"
            className="object-cover"
            fallback={<BrandPanel seed={index} />}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10">
            <p className="text-eyebrow text-violet-200">Task force {number}</p>
            <DialogTitle className="mt-3 text-display-md text-white">
              {name}
            </DialogTitle>
          </div>
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          <DialogDescription className="text-fg text-lead">
            {description}
          </DialogDescription>
          <div className="mt-8 grid gap-3 border-hairline border-t pt-8 md:grid-cols-[8rem_minmax(0,1fr)] md:items-baseline md:gap-8">
            <h3 className="text-eyebrow text-fg-subtle">About</h3>
            <p className="text-body text-fg-muted leading-relaxed">
              {detailedDescription}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
