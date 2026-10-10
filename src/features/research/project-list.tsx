import { FallbackImage, Reveal, Tag, TextLink } from "@tum.ai/ui-kit";
import { AffiliationNames } from "./affiliations";
import type { ResearchEntry } from "./research";
import { ResearchMotifArt } from "./research-motifs";

function KeywordTags({ keywords }: { keywords: string[] }) {
  if (keywords.length === 0) return null;
  return (
    <ul aria-label="Keywords" className="mt-5 flex flex-wrap gap-1.5">
      {keywords.map((keyword) => (
        <li key={keyword}>
          <Tag>{keyword}</Tag>
        </li>
      ))}
    </ul>
  );
}

/**
 * The project's paper, linked out by its host ("Paper on arxiv.org"). Renders
 * nothing unless the entry carries a safe publication URL, which the CMS
 * allows on ongoing and completed projects alike.
 */
function PublicationLink({ project }: { project: ResearchEntry }) {
  if (!project.publicationUrl || !project.publicationHost) return null;
  return (
    <TextLink href={project.publicationUrl} arrow className="mt-5 text-small">
      Paper on {project.publicationHost}
    </TextLink>
  );
}

/**
 * The field, status and start of an ongoing project as one quiet line
 * ("LLM safety · Ongoing · Since 2025"); only the status when the CMS gives
 * neither field nor year.
 */
function ProjectFacts({ project }: { project: ResearchEntry }) {
  const facts = [
    project.field,
    "Ongoing",
    project.startYear ? `Since ${project.startYear}` : undefined,
  ].filter(Boolean);
  return <p className="mt-2 text-fg-subtle text-meta">{facts.join(" · ")}</p>;
}

/* Share of the 4:3 tile each logo covers, so wide wordmarks and square
   crests read at the same weight; capped so a wordmark keeps a margin. */
const LOGO_AREA = 0.13;
const LOGO_MAX_WIDTH = 82;

/** A logo's width in percent of the tile, for its aspect ratio and how many share the tile. */
function logoWidth(aspectRatio: number | undefined, count: number) {
  const area = (LOGO_AREA / count) * 4 * 3;
  const width = (Math.sqrt(area * (aspectRatio ?? 3)) / 4) * 100;
  return Math.min(width, LOGO_MAX_WIDTH);
}

/**
 * Who the project is with: the institutions' logos on a quiet 4:3 tile,
 * every row the same size so the list reads as one column, over the line
 * drawing of the project's subject when the CMS picks one. Logos are
 * decorative (the affiliations name the institutions); a project whose
 * institutions have no logo sets their names instead, so no row is empty.
 * CMS images are served unoptimized: CMS hosts are outside next/image's list.
 */
function LogoTile({ project }: { project: ResearchEntry }) {
  const { logos, affiliations, motif } = project;
  return (
    <div
      aria-hidden="true"
      className="relative isolate flex aspect-[4/3] flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl bg-sunken p-6"
    >
      {motif ? <ResearchMotifArt motif={motif} /> : null}
      {logos.length > 0
        ? logos.map((logo) => (
            <div
              key={logo.src}
              className="relative"
              style={{
                width: `${logoWidth(logo.aspectRatio, logos.length)}%`,
                aspectRatio: logo.aspectRatio ?? 3,
              }}
            >
              <FallbackImage
                src={logo.src}
                alt=""
                fill
                unoptimized
                sizes="12rem"
                className="object-contain"
                fallback={null}
              />
            </div>
          ))
        : affiliations.map(({ name }) => (
            <span
              key={name}
              className="relative text-balance text-center font-semibold text-fg-muted text-heading-sm"
            >
              {name}
            </span>
          ))}
    </div>
  );
}

/**
 * A project's highlights ("2.3M single cells") as a ruled list under its
 * tile, read like a figure's legend.
 */
function ProjectHighlights({ highlights }: { highlights: string[] }) {
  if (highlights.length === 0) return null;
  return (
    <ul aria-label="Highlights" className="mt-4 text-fg-muted text-meta">
      {highlights.map((highlight) => (
        <li
          key={highlight}
          className="tabular border-hairline border-b py-2 first:border-t"
        >
          {highlight}
        </li>
      ))}
    </ul>
  );
}

/**
 * Ongoing projects as hairline rows, set like a paper's first lines: the
 * title, the institutions with their index numbers, a facts line, the
 * abstract, and the paper when the CMS links one (a preprint often precedes
 * completion). Beside it, a tile with the institutions' logos.
 */
export function ProjectList({ projects }: { projects: ResearchEntry[] }) {
  return (
    <ul className="border-hairline-strong border-t">
      {projects.map((project, position) => (
        <Reveal
          as="li"
          key={project.id}
          delay={Math.min(position, 3) * 60}
          className="border-hairline border-b"
        >
          <article
            aria-labelledby={project.titleId}
            className="grid gap-x-10 gap-y-6 py-8 md:grid-cols-[minmax(0,1fr)_13rem] md:py-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-x-16"
          >
            <div className="min-w-0">
              <h3
                id={project.titleId}
                className="max-w-3xl text-balance text-fg text-heading-md md:text-heading-lg"
              >
                {project.title}
              </h3>
              <AffiliationNames
                affiliations={project.affiliations}
                className="mt-3"
              />
              <ProjectFacts project={project} />
              <p className="mt-5 max-w-2xl text-body text-fg-muted">
                {project.description}
              </p>
              <PublicationLink project={project} />
              <KeywordTags keywords={project.keywords} />
            </div>
            <div className="max-md:max-w-sm md:self-start">
              <LogoTile project={project} />
              <ProjectHighlights highlights={project.highlights} />
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * Completed projects as a numbered references list. Numbers are the list's
 * order, so they are drawn for sighted readers and left to the `ol` for
 * assistive tech. A safe publication URL links out by its host.
 */
export function ReferenceList({ projects }: { projects: ResearchEntry[] }) {
  return (
    <ol className="border-hairline-strong border-t">
      {projects.map((project, position) => (
        <Reveal
          as="li"
          key={project.id}
          delay={Math.min(position, 3) * 60}
          className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-4 border-hairline border-b py-8 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-x-8 md:py-10"
        >
          <span
            aria-hidden="true"
            className="tabular text-heading-md text-highlight"
          >
            [{position + 1}]
          </span>
          <article aria-labelledby={project.titleId} className="min-w-0">
            <h3
              id={project.titleId}
              className="max-w-3xl text-balance text-fg text-heading-md"
            >
              {project.title}
            </h3>
            <AffiliationNames
              affiliations={project.affiliations}
              className="mt-2"
            />
            <p className="mt-4 max-w-2xl text-fg-muted text-small">
              {project.description}
            </p>
            <PublicationLink project={project} />
          </article>
        </Reveal>
      ))}
    </ol>
  );
}
