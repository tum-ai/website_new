import type { LogoItem } from "@tum.ai/ui-kit";
import { getPartnerKey } from "@/features/partners";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner, ResearchProject, ResearchStatus } from "@/lib/types";
import type { LabSite, LabSiteOrganization } from "./data/lab-sites";
import { isResearchMotif, type ResearchMotif } from "./data/research-motifs";
import { sameName, splitResearchTitle } from "./research-title";

/**
 * An institution the page names: an organisation (with its `key`) when a
 * reference or a partner names it, only a name when a research title does.
 */
export type Institution = { name: string; key?: string };

/** An institution on a project, with its number in the page's affiliation index. */
export type ProjectAffiliation = {
  name: string;
  /** 1-based position in `ResearchIndex.affiliations`. */
  index: number;
};

/** An institution's logo for a project's tile. */
type ProjectLogo = {
  name: string;
  src: string;
  /** Width over height, from the Sanity asset's file name when it has one. */
  aspectRatio?: number;
};

/**
 * A research project shaped for the page on the server: plain, serializable
 * props, so client islands only receive what they render.
 */
export type ResearchEntry = {
  /** Stable id from the CMS. */
  id: string;
  /** Element id of the entry's title. */
  titleId: string;
  /** The title without the institutions before its colon. */
  title: string;
  description: string;
  /** The research area ("LLM safety"), if the CMS names one. */
  field?: string;
  /** The year the project started, if the CMS gives one. */
  startYear?: number;
  /** The line drawing on the project's tile, when the CMS picks one this site draws. */
  motif?: ResearchMotif;
  /**
   * Short facts about the project ("2.3M single cells"), trimmed and
   * de-duplicated in CMS order, at most {@link MAX_HIGHLIGHTS}.
   */
  highlights: string[];
  /**
   * Logos of the project's institutions that have one, in citation order
   * and without repeats. The page sets the institutions' names instead when
   * none has a logo.
   */
  logos: ProjectLogo[];
  /** Publication link, only when it is a safe http(s) URL. */
  publicationUrl?: string;
  /** The publication's host without "www." ("arxiv.org"), its link label. */
  publicationHost?: string;
  /** Trimmed, de-duplicated keywords in CMS order. */
  keywords: string[];
  status: ResearchStatus;
  /**
   * The project's institutions: its `institutions` references, or for a
   * document without them the names in its title, in order.
   */
  affiliations: ProjectAffiliation[];
};

/**
 * Everything /research lists, derived from the CMS. The affiliation index
 * works like a paper's title block: institutions named on a project are
 * numbered in order of first appearance (ongoing projects first, in CMS
 * order), and every project cites them by those numbers.
 */
export type ResearchIndex = {
  /** Institutions named on projects; `ProjectAffiliation.index` points here. */
  affiliations: Institution[];
  ongoing: ResearchEntry[];
  completed: ResearchEntry[];
};

/** How many highlights a row lists; the rest of a longer CMS list is dropped. */
const MAX_HIGHLIGHTS = 3;

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

function getHost(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function hasStatus(
  project: ResearchProject,
): project is ResearchProject & { status: ResearchStatus } {
  return project.status === "ongoing" || project.status === "completed";
}

/**
 * A project's institutions: the organisations its `institutions` field
 * references (those that resolve), or, for a document without any, the
 * names before the colon in its title (the old site's convention).
 */
function institutionsOf(project: ResearchProject): Institution[] {
  const referenced = (project.institutions ?? []).flatMap((organization) => {
    const key = organization?.key?.trim();
    const name = organization?.name?.trim();
    return key && name ? [{ key, name }] : [];
  });
  if (referenced.length > 0) return referenced;
  return splitResearchTitle(project.title).institutions.map((name) => ({
    name,
  }));
}

/* Sanity asset file names end in "-<width>x<height>.<ext>". */
const sanityDimensions = /-(\d+)x(\d+)\.[a-z0-9]+(?:\?.*)?$/i;

/** Width over height from a Sanity asset URL, or undefined for other URLs. */
function aspectRatioOf(src: string): number | undefined {
  const match = sanityDimensions.exec(src);
  const width = Number(match?.[1]);
  const height = Number(match?.[2]);
  return width > 0 && height > 0 ? width / height : undefined;
}

/** The referenced institutions' logos, in order, each image once. */
function logosOf(project: ResearchProject): ProjectLogo[] {
  const seen = new Set<string>();
  return (project.institutions ?? []).flatMap((organization) => {
    const name = organization?.name?.trim();
    const src = organization?.logo?.trim();
    if (!name || !src || seen.has(src)) return [];
    seen.add(src);
    return [{ name, src, aspectRatio: aspectRatioOf(src) }];
  });
}

/** Whether two institutions are one: the same organisation, or the same name. */
function sameInstitution(a: Institution, b: Institution) {
  return a.key && b.key ? a.key === b.key : sameName(a.name, b.name);
}

/**
 * Builds the /research index from the CMS: the numbered affiliations and
 * the ongoing and completed projects in CMS order. Projects without a
 * status are not listed. The title's lead ("Institution: ") is never shown:
 * the institutions come from the references, or from that lead.
 */
export function getResearchIndex(
  projects: readonly ResearchProject[],
): ResearchIndex {
  const listed = projects.filter(hasStatus);
  const ordered = [
    ...listed.filter((project) => project.status === "ongoing"),
    ...listed.filter((project) => project.status === "completed"),
  ];

  const affiliations: Institution[] = [];
  const entries = ordered.map((project): ResearchEntry => {
    const { title } = splitResearchTitle(project.title);
    const publicationUrl = getSafeExternalUrl(project.publication) ?? undefined;
    return {
      id: project.id,
      titleId: `research-${project.id}-title`,
      title,
      description: project.description,
      field: project.field?.trim() || undefined,
      startYear: project.startYear,
      motif: isResearchMotif(project.motif) ? project.motif : undefined,
      highlights: cleanKeywords(project.highlights).slice(0, MAX_HIGHLIGHTS),
      logos: logosOf(project),
      publicationUrl,
      publicationHost: publicationUrl ? getHost(publicationUrl) : undefined,
      keywords: cleanKeywords(project.keywords),
      status: project.status,
      affiliations: institutionsOf(project).map((institution) => {
        let position = affiliations.findIndex((known) =>
          sameInstitution(known, institution),
        );
        if (position < 0) position = affiliations.push(institution) - 1;
        const { name } = affiliations[position] ?? institution;
        return { name, index: position + 1 };
      }),
    };
  });

  return {
    affiliations,
    ongoing: entries.filter((entry) => entry.status === "ongoing"),
    completed: entries.filter((entry) => entry.status === "completed"),
  };
}

/**
 * The research partners for the logo strip, in CMS order: those with
 * artwork, linked when their link is a safe http(s) URL. The aspect ratio
 * comes from the Sanity asset's file name, so every logo can be sized to
 * the same area; other URLs leave it unknown.
 */
export function getPartnerLogos(partners: readonly Partner[]): LogoItem[] {
  return partners.flatMap(({ name, image, link }) => {
    const label = name?.trim();
    if (!label || !image) return [];
    return [
      {
        name: label,
        src: image,
        href: getSafeExternalUrl(link) ?? undefined,
        aspectRatio: aspectRatioOf(image),
      },
    ];
  });
}

/** A site on the globe with the institutions from the page that are there. */
export type LocatedSite = Omit<LabSite, "organizations"> & {
  /** Named institutions at this site, in the order they were given. */
  institutions: string[];
  /**
   * Great-circle distance to the nearest other site, in km (Infinity when
   * alone). The globe labels a site once this gap is wide enough on screen.
   */
  nearestKm: number;
};

/** Earth's mean radius, in km. */
export const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two [latitude, longitude] points, in km. */
export function distanceKm(
  [latA, lonA]: [number, number],
  [latB, lonB]: [number, number],
): number {
  const rad = Math.PI / 180;
  const dLat = (latB - latA) * rad;
  const dLon = (lonB - lonA) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latA * rad) * Math.cos(latB * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Whether `institution` is `organization`: by key when it has one,
 * otherwise by name (the organisation's name, short name or key, compared
 * with `getPartnerKey`, whose aliases know the titles' spellings such as
 * "Helmholtz Zentrum").
 */
function isAt(organization: LabSiteOrganization, institution: Institution) {
  if (institution.key) return institution.key === organization.key;
  const name = getPartnerKey(institution.name);
  return [organization.key, organization.name, organization.shortName].some(
    (known) => known !== undefined && getPartnerKey(known) === name,
  );
}

/**
 * Places the page's institutions on the globe: every site of `labSites`
 * (the render's list, `getLabSiteList()`) that lists one of
 * `institutions`, plus TUM.ai's home, in list order. Institutions no site
 * lists come back as `unplaced` (by name), for the page to report.
 */
export function getLabSites(
  institutions: readonly Institution[],
  labSites: readonly LabSite[],
): {
  sites: LocatedSite[];
  unplaced: string[];
} {
  const placed = new Map<string, Institution[]>();
  const unplaced: Institution[] = [];
  for (const raw of institutions) {
    const institution = { ...raw, name: raw.name.trim() };
    if (!institution.name) continue;
    const site = labSites.find((candidate) =>
      candidate.organizations.some((organization) =>
        isAt(organization, institution),
      ),
    );
    const list = site ? (placed.get(site.id) ?? []) : unplaced;
    if (!list.some((known) => sameInstitution(known, institution))) {
      list.push(institution);
    }
    if (site) placed.set(site.id, list);
  }
  const shown = labSites.filter((site) => site.home || placed.has(site.id));
  const sites = shown.map(({ organizations: _, ...site }) => ({
    ...site,
    institutions: (placed.get(site.id) ?? []).map(({ name }) => name),
    nearestKm: Math.min(
      ...shown
        .filter((other) => other.id !== site.id)
        .map((other) => distanceKm(site.location, other.location)),
    ),
  }));
  return { sites, unplaced: unplaced.map(({ name }) => name) };
}

const reportedUnplaced = new Set<string>();

/**
 * Logs the institutions the globe leaves out (no lab site lists their
 * organisation), once per name and server process, so a new institution
 * is not dropped silently. Add it to a lab site in the Studio.
 */
export function reportUnplaced(unplaced: readonly string[]): void {
  const fresh = unplaced.filter((name) => !reportedUnplaced.has(name));
  if (fresh.length === 0) return;
  for (const name of fresh) reportedUnplaced.add(name);
  console.warn(
    `[research] Not on the globe, no lab site lists them: ${fresh.join(", ")}. Add each organisation to a lab site in the Studio.`,
  );
}
