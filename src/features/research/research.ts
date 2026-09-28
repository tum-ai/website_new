import type { LogoItem } from "@/components/ds";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner, ResearchProject, ResearchStatus } from "@/lib/types";

/**
 * A research project shaped for the cards and the detail dialog: plain,
 * serializable props, computed on the server so the client only receives
 * what it renders.
 */
export type ResearchCardData = {
  /** Stable id, also used for the card title's element id. */
  id: string;
  /** Element id of the card title; the dialog trigger is labelled by it. */
  titleId: string;
  title: string;
  description: string;
  /** Image URL from the CMS; without one the card shows a brand panel. */
  image?: string;
  /** Publication link, only when it is a safe http(s) URL. */
  publicationUrl?: string;
  /** Trimmed, de-duplicated keywords in CMS order. */
  keywords: string[];
  status: ResearchStatus;
  /** Visible status label ("Ongoing", "Completed"). */
  statusLabel: string;
  /** The collaborating institution, shown as the eyebrow. */
  collaborator: string;
};

/** The /research project lists, each in CMS order. */
export type ResearchProjectLists = {
  ongoing: ResearchCardData[];
  past: ResearchCardData[];
};

/** Visible label per CMS status. */
export const researchStatusLabels: Record<ResearchStatus, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
};

/* Institutions whose names the CMS titles abbreviate or embed in a longer
   lead ("IBM Research: …", "Helmholtz Munich: …"). */
const knownCollaborators: [RegExp, string][] = [
  [/^IBM\b/i, "IBM"],
  [/^MIT\b/i, "MIT"],
  [/^TUM\b/i, "TUM"],
  [/^LMU\b/i, "LMU"],
  [/Helmholtz/i, "Helmholtz"],
  [/University of Cambridge/i, "University of Cambridge"],
];

/**
 * The collaborator named in a project title: the part before the first colon
 * (or comma), normalized for the institutions in `knownCollaborators`.
 */
export function getCollaboratorName(title: string): string {
  const trimmed = title.trim();
  const lead = trimmed.split(":")[0]?.trim() || trimmed;
  const known = knownCollaborators.find(([pattern]) => pattern.test(lead));
  if (known) return known[1];
  return lead.split(",")[0]?.trim() || lead;
}

/** Trims keywords and drops empty and repeated ones (they key the tag list). */
export function cleanKeywords(keywords: readonly string[]): string[] {
  const seen = new Set<string>();
  return keywords.flatMap((keyword) => {
    const value = keyword.trim();
    if (!value || seen.has(value)) return [];
    seen.add(value);
    return [value];
  });
}

/** "01"-style counter for a zero-based list position. */
export function formatCounter(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function toCardData(
  project: ResearchProject & { status: ResearchStatus },
): ResearchCardData {
  return {
    id: project.id,
    titleId: `research-${project.id}-title`,
    title: project.title,
    description: project.description,
    image: project.image || undefined,
    publicationUrl: getSafeExternalUrl(project.publication) ?? undefined,
    keywords: cleanKeywords(project.keywords),
    status: project.status,
    statusLabel: researchStatusLabels[project.status],
    collaborator: getCollaboratorName(project.title),
  };
}

function hasStatus<S extends ResearchStatus>(status: S) {
  return (
    project: ResearchProject,
  ): project is ResearchProject & { status: S } => project.status === status;
}

/**
 * Splits the CMS projects into ongoing and past (completed) lists, keeping
 * the CMS order within each. Projects without a status are not listed.
 */
export function getResearchProjectLists(
  projects: readonly ResearchProject[],
): ResearchProjectLists {
  return {
    ongoing: projects.filter(hasStatus("ongoing")).map(toCardData),
    past: projects.filter(hasStatus("completed")).map(toCardData),
  };
}

/**
 * Research partners for the collaborator logo wall. Only partners with both
 * a link and a logo are shown, in CMS order.
 */
export function getCollaboratorLogos(partners: readonly Partner[]): LogoItem[] {
  return partners.flatMap(({ name, link, image }) =>
    link && image ? [{ name, src: image, href: link, alt: name }] : [],
  );
}

/** Logo wall columns that fill whole rows for up to six collaborators. */
export function getLogoColumns(count: number): 3 | 4 | 5 | 6 {
  if (count >= 6) return 6;
  if (count === 5) return 5;
  if (count === 4) return 4;
  return 3;
}
