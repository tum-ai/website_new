import { FallbackImage, Reveal, Tag, TextLink } from "@tum.ai/ui-kit";
import { AffiliationNames } from "./affiliations";
import type { ResearchEntry } from "./research";

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
 * Ongoing projects as hairline rows, set like a paper's first lines: the
 * title, the institutions with their index numbers, the abstract, and the
 * paper when the CMS links one (a preprint often precedes completion). The
 * project's CMS image sits beside it when there is one (served unoptimized:
 * CMS hosts are outside next/image's list); a missing or broken image leaves
 * the row text-only.
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
              <p className="mt-5 max-w-2xl text-body text-fg-muted">
                {project.description}
              </p>
              <PublicationLink project={project} />
              <KeywordTags keywords={project.keywords} />
            </div>
            {project.image ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sunken max-md:max-w-sm md:self-start">
                <FallbackImage
                  src={project.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 17rem, (min-width: 768px) 13rem, 24rem"
                  className="object-cover"
                  fallback={null}
                />
              </div>
            ) : null}
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
