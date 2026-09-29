import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { type BackfillDocument, backfillId } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  type ContentImage,
} from "@/lib/cms-content-model";
import { backfillContentImage, keyedItems } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import type {
  LAB_SITES_QUERY_RESULT,
  RESEARCH_COPY_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import { type LabSite, labSites } from "./data/lab-sites";
import {
  type FigurePanel,
  type ResearchCopy,
  researchCopyTemplate,
  researchPageTokens,
} from "./data/research-copy";

/**
 * The /research content slice: the `researchCopy` singleton (hero, abstract,
 * Figure 1, section headings, closing) and the `labSite` documents that
 * place institutions on the hero globe. The projects come from the
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
  institutions
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

const isLabSite = (value: unknown): value is LabSite => {
  const site = (value ?? {}) as Partial<LabSite>;
  return Boolean(
    site.id &&
      site.city &&
      site.location?.length === 2 &&
      site.location.every((degrees) => typeof degrees === "number") &&
      site.institutions?.length,
  );
};

/**
 * The cities on the hero globe and the institution names that place a lab
 * there: the CMS `labSite` list when there is one, otherwise the code list.
 * The page places its institutions on it with `getLabSites` (`research.ts`).
 */
export async function getLabSiteList(): Promise<LabSite[]> {
  const tokens = await getContentTokens();
  return loadContent<LabSite[], LAB_SITES_QUERY_RESULT>({
    fallback: labSites,
    query: LAB_SITES_QUERY,
    tags: ["content:labSite"],
    label: "the lab sites",
    mockDocuments: buildResearchBackfill,
    select: (result) => {
      const filled = fillCmsCopy(result, tokens, "the lab sites");
      return (Array.isArray(filled) ? filled : [])
        .filter(isLabSite)
        .map(({ home, ...site }) => (home ? { ...site, home } : site));
    },
  });
}

/** The /research copy and lab sites as documents for `pnpm sanity:backfill`. */
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
    ...labSites.map(({ id, location: [lat, lng], home, ...site }, index) => ({
      _id: backfillId("lab-site", id),
      _type: "labSite",
      order: (index + 1) * 10,
      key: { _type: "slug", current: id },
      ...site,
      institutions: [...site.institutions],
      location: { _type: "geopoint", lat, lng },
      ...(home ? { home } : {}),
    })),
  ];
}
