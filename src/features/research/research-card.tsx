import { FileText } from "lucide-react";
import {
  BrandPanel,
  ButtonLink,
  CornerHint,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  FallbackImage,
  SpotlightCard,
  StatusBadge,
  Tag,
} from "@/components/ds";
import { cn } from "@/lib/cn";
import { formatCounter, type ResearchCardData } from "./research";

type ResearchCardProps = {
  /** The project, shaped on the server by `getResearchProjectLists`. */
  project: ResearchCardData;
  /** Position in its list: the "01" counter and the brand panel composition. */
  index: number;
  /** `card`: image-led grid card. `row`: compact archive row with a thumbnail. */
  layout?: "card" | "row";
};

function KeywordTags({
  keywords,
  className,
}: {
  keywords: string[];
  className?: string;
}) {
  if (keywords.length === 0) return null;
  return (
    <ul
      aria-label="Keywords"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {keywords.map((keyword) => (
        <li key={keyword}>
          <Tag>{keyword}</Tag>
        </li>
      ))}
    </ul>
  );
}

/** Small static status line for cards; the dialog uses the full StatusBadge. */
function StatusLine({ project }: { project: ResearchCardData }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold text-fg-muted text-meta">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          project.status === "ongoing"
            ? "bg-violet-500 ring-3 ring-violet-500/18"
            : "border border-fg-subtle",
        )}
      />
      {project.statusLabel}
    </span>
  );
}

function PublicationHint() {
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-fg-subtle text-meta">
      <FileText aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
      Publication
    </span>
  );
}

/**
 * The project photo, or a brand panel with the collaborator as typographic
 * art when there is none or it fails to load. CMS URLs sit outside
 * next/image's configured hosts, so the image is served unoptimized.
 */
function ResearchMedia({
  project,
  index,
  alt,
  sizes,
  artClassName,
}: {
  project: ResearchCardData;
  index: number;
  alt: string;
  sizes: string;
  artClassName: string;
}) {
  return (
    <FallbackImage
      src={project.image}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className="zoom-media object-cover"
      fallback={
        <BrandPanel seed={index}>
          <span
            className={cn(
              "absolute bottom-0 left-0 p-5 font-light text-white/90 leading-none md:p-6",
              artClassName,
            )}
          >
            {project.collaborator}
          </span>
        </BrandPanel>
      }
    />
  );
}

/**
 * A research project: the collaborator as eyebrow, title, keywords and
 * status. The whole surface is one dialog trigger (labelled by the title)
 * that opens the full description and the publication link. A server
 * component: the ds Dialog and FallbackImage are the only client parts.
 */
export function ResearchCard({
  project,
  index,
  layout = "card",
}: ResearchCardProps) {
  const { titleId, publicationUrl } = project;
  const number = formatCounter(index);

  const trigger = (
    <DialogTrigger
      aria-labelledby={titleId}
      className="absolute inset-0 z-10 rounded-[inherit]"
    />
  );

  const card =
    layout === "row" ? (
      <article className="group/zoom relative isolate grid grid-cols-[minmax(0,1fr)_6.5rem] items-start gap-x-5 gap-y-4 rounded-3xl py-6 sm:grid-cols-[2.5rem_minmax(0,1fr)_10rem] md:grid-cols-[3.5rem_minmax(0,1fr)_14rem] md:gap-x-8 md:py-8 lg:grid-cols-[4rem_minmax(0,1fr)_17rem]">
        {/* Explicit placement: on phones the tags run under both the text
            and the thumbnail; from `sm` they sit in the text column. The
            counter and the text column share one baseline. */}
        <span
          aria-hidden="true"
          className="tabular hidden self-baseline text-eyebrow text-fg-subtle sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:block"
        >
          {number}
        </span>
        <div className="col-start-1 row-start-1 min-w-0 self-baseline sm:col-start-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <p className="text-eyebrow text-highlight uppercase">
              {project.collaborator}
            </p>
            {publicationUrl ? <PublicationHint /> : null}
          </div>
          <h3
            id={titleId}
            className="mt-2.5 text-fg text-heading-md transition-colors duration-300 ease-brand group-hover/zoom:text-highlight"
          >
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-2xl text-fg-muted text-small max-sm:hidden">
            {project.description}
          </p>
        </div>
        {/* Radius 24px = disc radius 16px + 8px inset, so the disc sits
            concentric in the corner. */}
        <div
          className={cn(
            "relative col-start-2 row-start-1 aspect-square overflow-hidden rounded-3xl bg-sunken sm:col-start-3 sm:aspect-[16/10]",
            project.keywords.length > 0 && "sm:row-span-2",
          )}
        >
          <ResearchMedia
            project={project}
            index={index}
            alt=""
            sizes="(min-width: 1024px) 17rem, (min-width: 640px) 10rem, 6.5rem"
            artClassName="hidden text-heading-lg md:block"
          />
          <CornerHint icon="open" className="absolute top-2 right-2 size-8" />
        </div>
        <KeywordTags
          keywords={project.keywords}
          className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2"
        />
        {trigger}
      </article>
    ) : (
      <SpotlightCard
        variant="raised"
        padding="none"
        interactive
        className="group/zoom flex h-full flex-col sm:max-lg:grid sm:max-lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]"
      >
        {/* Media bleeds to the card edge: outer corners follow the card's
            radius (minus its 1px border), inner edges stay straight. */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-[calc(1.5rem-1px)] bg-sunken sm:max-lg:aspect-auto sm:max-lg:h-full sm:max-lg:min-h-64 sm:max-lg:rounded-l-[calc(1.5rem-1px)] sm:max-lg:rounded-tr-none">
          <ResearchMedia
            project={project}
            index={index}
            alt=""
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            artClassName="text-display-md"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 sm:max-lg:p-7 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-eyebrow text-highlight uppercase">
              {project.collaborator}
            </p>
            <span
              aria-hidden="true"
              className="tabular text-eyebrow text-fg-subtle"
            >
              {number}
            </span>
          </div>
          <h3 id={titleId} className="mt-3 text-fg text-heading-md">
            {project.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-fg-muted text-small">
            {project.description}
          </p>
          <KeywordTags keywords={project.keywords} className="mt-5" />
          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between gap-4 border-hairline border-t pt-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <StatusLine project={project} />
                {publicationUrl ? <PublicationHint /> : null}
              </div>
              <CornerHint icon="open" variant="tonal" className="size-9" />
            </div>
          </div>
        </div>
        {trigger}
      </SpotlightCard>
    );

  return (
    <Dialog>
      {card}
      <DialogContent size="lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-sunken sm:aspect-[2/1]">
          <ResearchMedia
            project={project}
            index={index}
            alt={project.title}
            sizes="(min-width: 800px) 768px, 100vw"
            artClassName="text-display-lg"
          />
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-eyebrow text-highlight uppercase">
              {project.collaborator}
            </p>
            <StatusBadge
              status={project.status === "ongoing" ? "live" : "idle"}
            >
              {project.statusLabel}
            </StatusBadge>
          </div>
          <DialogTitle className="mt-4 max-w-2xl">{project.title}</DialogTitle>
          <KeywordTags keywords={project.keywords} className="mt-5" />
          <div className="mt-8 grid gap-3 border-hairline border-t pt-8 md:grid-cols-[8rem_minmax(0,1fr)] md:items-baseline md:gap-8">
            <h3 className="text-eyebrow text-fg-subtle uppercase">About</h3>
            <DialogDescription className="leading-relaxed">
              {project.description}
            </DialogDescription>
          </div>
          {publicationUrl ? (
            <div className="mt-8 flex border-hairline border-t pt-8 md:pl-40">
              <ButtonLink href={publicationUrl} arrow="external">
                Read Publication
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
