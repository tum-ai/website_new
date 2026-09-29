import type { LogoItem } from "@/components/ds";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner, ResearchProject, ResearchStatus } from "@/lib/types";
import { type LabSite, labSites } from "./data/lab-sites";

/** An institution on a project, with its number in the page's affiliation index. */
export type ProjectAffiliation = {
  name: string;
  /** 1-based position in `ResearchIndex.affiliations`. */
  index: number;
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
  /** Image URL from the CMS, if any. */
  image?: string;
  /** Publication link, only when it is a safe http(s) URL. */
  publicationUrl?: string;
  /** The publication's host without "www." ("arxiv.org"), its link label. */
  publicationHost?: string;
  /** Trimmed, de-duplicated keywords in CMS order. */
  keywords: string[];
  status: ResearchStatus;
  /** The institutions named in the CMS title, in title order. */
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
  affiliations: string[];
  ongoing: ResearchEntry[];
  completed: ResearchEntry[];
};

/* Segments of a title's lead that name a person, not an institution
   ("University of Cambridge, Prof. Olaf Wysocki: …"). */
const personPattern = /^(prof|dr)\b\.?/i;

/* Short forms the CMS titles use for an institution named in full elsewhere. */
const institutionAliases: Record<string, string> = {
  CAMP: "TUM CAMP",
};

function sameName(a: string, b: string) {
  return a.localeCompare(b, "en", { sensitivity: "base" }) === 0;
}

/** Whether `specific` names a part of `general` ("IBM Almaden" of "IBM"). */
function isPartOf(specific: string, general: string) {
  return specific.toLowerCase().startsWith(`${general.toLowerCase()} `);
}

/** Collapses the whitespace and line breaks CMS titles sometimes contain. */
function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Splits a CMS title "Institution, Institution: Topic" into the institutions
 * and the topic. Without a colon the whole title is the topic.
 */
export function splitResearchTitle(rawTitle: string): {
  institutions: string[];
  title: string;
} {
  const title = normalizeSpace(rawTitle);
  const colon = title.indexOf(":");
  if (colon < 0) return { institutions: [], title };

  const names = title
    .slice(0, colon)
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment && !personPattern.test(segment))
    .map((segment) => institutionAliases[segment] ?? segment);
  const unique = names.filter(
    (name, index) =>
      names.findIndex((other) => sameName(other, name)) === index,
  );
  // "TUM" beside "TUM CAMP" says nothing the narrower name doesn't.
  const institutions = unique.filter(
    (name) => !unique.some((other) => isPartOf(other, name)),
  );
  return {
    institutions,
    title: title.slice(colon + 1).trim() || title,
  };
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

function getHost(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function hasStatus(
  project: ResearchProject,
): project is ResearchProject & { status: ResearchStatus } {
  return project.status === "ongoing" || project.status === "completed";
}

/**
 * Builds the /research index from the CMS: the numbered affiliations and
 * the ongoing and completed projects in CMS order. Projects without a
 * status are not listed.
 */
export function getResearchIndex(
  projects: readonly ResearchProject[],
): ResearchIndex {
  const listed = projects.filter(hasStatus);
  const ordered = [
    ...listed.filter((project) => project.status === "ongoing"),
    ...listed.filter((project) => project.status === "completed"),
  ];

  const affiliations: string[] = [];
  const entries = ordered.map((project): ResearchEntry => {
    const { institutions, title } = splitResearchTitle(project.title);
    const publicationUrl = getSafeExternalUrl(project.publication) ?? undefined;
    return {
      id: project.id,
      titleId: `research-${project.id}-title`,
      title,
      description: project.description,
      image: project.image || undefined,
      publicationUrl,
      publicationHost: publicationUrl ? getHost(publicationUrl) : undefined,
      keywords: cleanKeywords(project.keywords),
      status: project.status,
      affiliations: institutions.map((name) => {
        let position = affiliations.findIndex((known) => sameName(known, name));
        if (position < 0) position = affiliations.push(name) - 1;
        return { name: affiliations[position] ?? name, index: position + 1 };
      }),
    };
  });

  return {
    affiliations,
    ongoing: entries.filter((entry) => entry.status === "ongoing"),
    completed: entries.filter((entry) => entry.status === "completed"),
  };
}

/* Sanity asset file names end in "-<width>x<height>.<ext>". */
const sanityDimensions = /-(\d+)x(\d+)\.[a-z0-9]+(?:\?.*)?$/i;

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
    const match = sanityDimensions.exec(image);
    const width = Number(match?.[1]);
    const height = Number(match?.[2]);
    return [
      {
        name: label,
        src: image,
        href: getSafeExternalUrl(link) ?? undefined,
        aspectRatio: width > 0 && height > 0 ? width / height : undefined,
      },
    ];
  });
}

/** A site on the globe with the institutions from the page that are there. */
export type LocatedSite = Omit<LabSite, "institutions"> & {
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
 * Places the page's institutions on the globe: every site that one of
 * `names` belongs to, plus TUM.ai's home, in `labSites` order. Names no
 * site lists (and "IBM", which several do) come back as `unplaced`.
 */
export function getLabSites(names: readonly string[]): {
  sites: LocatedSite[];
  unplaced: string[];
} {
  const placed = new Map<string, string[]>();
  const unplaced: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const site = labSites.find((candidate) =>
      candidate.institutions.some((known) => sameName(known, name)),
    );
    if (!site) {
      if (!unplaced.some((known) => sameName(known, name))) {
        unplaced.push(name);
      }
      continue;
    }
    const list = placed.get(site.id) ?? [];
    if (!list.some((known) => sameName(known, name))) list.push(name);
    placed.set(site.id, list);
  }
  const shown = labSites.filter((site) => site.home || placed.has(site.id));
  const sites = shown.map((site) => ({
    ...site,
    institutions: placed.get(site.id) ?? [],
    nearestKm: Math.min(
      ...shown
        .filter((other) => other !== site)
        .map((other) => distanceKm(site.location, other.location)),
    ),
  }));
  return { sites, unplaced };
}
