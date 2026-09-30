import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { buildOrganizationBackfill } from "@/features/partners/server";
import { type BackfillDocument, backfillId } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  type ContentImage,
} from "@/lib/cms-content-model";
import { backfillContentImage, keyedItems } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import { organizationReference } from "@/lib/organization-content";
import type {
  LAB_SITES_QUERY_RESULT,
  RESEARCH_COPY_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import {
  type LabSite,
  type LabSiteOrganization,
  labSites,
  labSiteTemplates,
} from "./data/lab-sites";
import {
  type FigurePanel,
  type ResearchCopy,
  researchCopyTemplate,
  researchPageTokens,
} from "./data/research-copy";
import { buildRexBackfill } from "./rex-content";

/**
 * The /research content slice: the `researchCopy` singleton (hero, abstract,
 * Figure 1, section headings, closing) and the `labSite` documents that
 * place institutions on the hero globe by their organisations. The projects come from the
 * `research` documents (`lib/sanity.ts`) and the REX institutions from their logo list (`rex-content.ts`);
 * the code fallbacks are in `data/`.
 */

export const RESEARCH_COPY_QUERY = defineQuery(`*[_id == "researchCopy"][0]{
  hero{ title, lead },
  partnersLabel,
  abstract{ label, statement, body, runningOne, runningMany },
  "figurePanels": figurePanels[]{ "image": image${CONTENT_IMAGE_PROJECTION}, caption },
  ongoing{ title, empty },
  completed{ title, lead },
  rex{ title, lead, logosLabel, processTitle, process, origin },
  closing{
    title,
    openSlot,
    partner{ audience, text },
    student{ audience, text }
  }
}`);

export const LAB_SITES_QUERY =
  defineQuery(`*[_type == "labSite"] | order(order asc){
  "id": key.current,
  city,
  "location": [location.lat, location.lng],
  home,
  "organizations": organizations[]->{ key, name, shortName }
}`);

/**
 * The /research copy: the CMS `researchCopy` over the code copy, site-fact
 * placeholders filled, the abstract's page tokens left for
 * `getAbstractBody`.
 */
export async function getResearchCopy(): Promise<ResearchCopy> {
  const tokens = await getContentTokens();
  return loadContent<ResearchCopy, RESEARCH_COPY_QUERY_RESULT>({
    fallback: fillCodeCopy(researchCopyTemplate, tokens, researchPageTokens),
    query: RESEARCH_COPY_QUERY,
    tags: ["content:researchCopy"],
    label: "the /research copy",
    mockDocuments: buildResearchBackfill,
    select: (result) => {
      const copy = fillCmsCopy(
        result,
        tokens,
        "the /research copy",
        researchPageTokens,
      ) as Partial<Record<keyof ResearchCopy, unknown>> | null;
      if (!copy) return null;
      const panels = (
        (copy.figurePanels ?? []) as {
          image?: ContentImage;
          caption?: string;
        }[]
      ).flatMap(({ image, caption }): FigurePanel[] =>
        image && caption ? [{ ...image, caption }] : [],
      );
      return { ...copy, figurePanels: panels };
    },
  });
}

type ProjectedSite = LAB_SITES_QUERY_RESULT[number];

/** The site's organisations that resolve, without empty short names. */
function siteOrganizations(
  organizations: ProjectedSite["organizations"],
): LabSiteOrganization[] {
  return (organizations ?? []).flatMap((organization) => {
    const key = organization?.key?.trim();
    const name = organization?.name?.trim();
    if (!key || !name) return [];
    const shortName = organization?.shortName?.trim();
    return [{ key, name, ...(shortName ? { shortName } : {}) }];
  });
}

/** A projected site the globe can draw, or `null`. */
function toLabSite({
  id,
  city,
  location,
  home,
  organizations,
}: ProjectedSite): LabSite | null {
  const [lat, lng] = location ?? [];
  const placed = siteOrganizations(organizations);
  if (
    !id ||
    !city ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    placed.length === 0
  ) {
    return null;
  }
  return {
    id,
    city,
    location: [lat, lng],
    ...(home ? { home } : {}),
    organizations: placed,
  };
}

/**
 * The cities on the hero globe and the organisations there: the CMS
 * `labSite` list when there is one, otherwise the code list. The page
 * places its institutions on it with `getLabSites` (`research.ts`).
 */
export async function getLabSiteList(): Promise<LabSite[]> {
  const tokens = await getContentTokens();
  return loadContent<LabSite[], LAB_SITES_QUERY_RESULT>({
    fallback: labSites,
    query: LAB_SITES_QUERY,
    tags: ["content:labSite", "content:organization"],
    label: "the lab sites",
    mockDocuments: () => [
      ...buildResearchBackfill(),
      ...buildRexBackfill(),
      ...buildOrganizationBackfill(),
    ],
    select: (result) => {
      const filled = fillCmsCopy(result, tokens, "the lab sites");
      return (Array.isArray(filled) ? (filled as ProjectedSite[]) : [])
        .map(toLabSite)
        .filter((site) => site !== null);
    },
  });
}

/**
 * The /research copy and lab sites as documents for `pnpm sanity:backfill`
 * (the sites reference the organisation slice's and the REX slice's
 * organisations).
 */
export function buildResearchBackfill(): BackfillDocument[] {
  const { figurePanels, ...copy } = researchCopyTemplate;
  return [
    {
      _id: "researchCopy",
      _type: "researchCopy",
      ...copy,
      figurePanels: keyedItems(
        "figurePanel",
        figurePanels.map(({ caption, ...image }) => ({
          image: backfillContentImage(image),
          caption,
        })),
      ),
    },
    ...labSiteTemplates.map(
      ({ id, location: [lat, lng], home, organizations, ...site }, index) => ({
        _id: backfillId("lab-site", id),
        _type: "labSite",
        order: (index + 1) * 10,
        key: { _type: "slug", current: id },
        ...site,
        organizations: organizations.map((key) => ({
          _key: key,
          ...organizationReference(key),
        })),
        location: { _type: "geopoint", lat, lng },
        ...(home ? { home } : {}),
      }),
    ),
  ];
}
