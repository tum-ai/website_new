import { Photo, Reveal } from "@/components/ds";
import { cn } from "@/lib/cn";
import type { TaskForce } from "./data/projects";
import { OverlapsLocator } from "./overlaps-figure";

/**
 * One task force as a chapter: where it sits in the figure and its field,
 * then what it does in its own words, the named work it does with a
 * partner, and a photo of its people where we have one.
 */
export function TaskForceChapter({
  taskForce,
  index,
  seatCount,
}: {
  taskForce: TaskForce;
  /** The task force's seat in the figure. */
  index: number;
  /** Seats in the figure, the open one included. */
  seatCount: number;
}) {
  const {
    slug,
    name,
    field,
    description,
    detailedDescription,
    work,
    photo,
    photoCaption,
  } = taskForce;
  const titleId = `${slug}-title`;
  return (
    <article
      id={slug}
      aria-labelledby={titleId}
      className="grid scroll-mt-header gap-x-12 gap-y-8 border-hairline border-b py-14 last:border-b-0 md:grid-cols-12 lg:py-20"
    >
      <div className="flex items-center gap-5 md:col-span-12 lg:col-span-3 lg:w-fit lg:flex-col lg:text-center">
        <OverlapsLocator
          count={seatCount}
          index={index}
          className="size-20 shrink-0 lg:size-32"
        />
        <p className="font-medium text-highlight text-small">{field}</p>
      </div>

      <Reveal
        className={cn(
          photo
            ? "md:col-span-7 lg:col-span-5"
            : "md:col-span-12 lg:col-span-8",
        )}
      >
        <h2 id={titleId} className="text-display-md text-fg">
          {name}
        </h2>
        <p className="mt-5 text-fg text-lead">{description}</p>
        <p className="mt-5 max-w-xl text-body text-fg-muted">
          {detailedDescription}
        </p>
        {work ? (
          <div className="mt-10">
            <h3 className="text-eyebrow text-fg-muted">
              Research projects with {work.partner} include
            </h3>
            <ul className="mt-4 border-hairline-strong border-t">
              {work.items.map((item) => (
                <li
                  key={item}
                  className="border-hairline border-b py-3.5 text-body text-fg"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Reveal>

      {photo ? (
        <Reveal delay={100} className="md:col-span-5 lg:col-span-4 lg:pt-3">
          <Photo
            src={photo.src}
            alt={photo.alt}
            caption={photoCaption}
            position={photo.objectPosition}
            aspect="4/3"
            sizes="(min-width: 1024px) 28vw, (min-width: 768px) 38vw, 100vw"
          />
        </Reveal>
      ) : null}
    </article>
  );
}
