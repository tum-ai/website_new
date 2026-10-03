import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  contentArray,
  contentBoolean,
  contentError,
  contentImage,
  contentObject,
  contentOptional,
  contentString,
  contentText,
  parseContent,
  requireArray,
  requireNumber,
  requireObject,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import type {
  LAB_SITES_QUERY_RESULT,
  RESEARCH_COPY_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import type { LabSite } from "./data/lab-sites";
import { type ResearchCopy, researchPageTokens } from "./data/research-copy";

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

const audience = contentObject({
  audience: contentString,
  text: contentString,
});
const copyParser = contentObject({
  hero: contentObject({ title: contentString, lead: contentString }),
  partnersLabel: contentString,
  abstract: contentObject({
    label: contentString,
    statement: contentString,
    body: contentString,
    runningOne: contentString,
    runningMany: contentString,
  }),
  figurePanels: contentArray(
    contentObject({ image: contentImage, caption: contentString }),
  ),
  ongoing: contentObject({ title: contentString, empty: contentString }),
  completed: contentObject({ title: contentString, lead: contentString }),
  rex: contentObject({
    title: contentString,
    lead: contentString,
    logosLabel: contentString,
    processTitle: contentString,
    process: contentArray(contentString),
    origin: contentString,
  }),
  closing: contentObject({
    title: contentString,
    openSlot: contentString,
    partner: audience,
    student: audience,
  }),
});
/** Validate all required research copy and flatten validated figure panels. */
export function selectResearchCopy(value: unknown): ResearchCopy {
  const { figurePanels, ...copy } = parseContent(
    value,
    copyParser,
    "the /research copy",
  );
  if (figurePanels.length < 2 || figurePanels.length > 4)
    contentError(
      "the /research copy",
      "figurePanels",
      "expected two to four required figure panels",
    );
  if (copy.rex.process.length < 2 || copy.rex.process.length > 7)
    contentError(
      "the /research copy",
      "rex.process",
      "expected two to seven required process steps",
    );
  return {
    ...copy,
    figurePanels: figurePanels.map(({ image, caption }) => ({
      ...image,
      caption,
    })),
  };
}
/** Read the required published research copy singleton. */
export async function getResearchCopy(): Promise<ResearchCopy> {
  const tokens = await getContentTokens();
  return loadContent<ResearchCopy, RESEARCH_COPY_QUERY_RESULT>({
    query: RESEARCH_COPY_QUERY,
    tags: ["content:researchCopy"],
    label: "the /research copy",
    select: (result) =>
      selectResearchCopy(
        fillCmsCopy(result, tokens, "the /research copy", researchPageTokens),
      ),
  });
}
const organizationParser = contentObject({
  key: contentString,
  name: contentString,
  shortName: contentOptional(contentText),
});
const siteParser = contentObject({
  id: contentString,
  city: contentString,
  home: contentOptional(contentBoolean),
  organizations: contentArray(organizationParser),
});
/** Validate optional sites and their resolved organization references as a whole. */
export function selectLabSites(value: unknown): LabSite[] {
  const label = "the lab sites";
  const sites = requireArray(value, label).map((value, index): LabSite => {
    const raw = requireObject(value, label, `[${index}]`);
    const site = parseContent(raw, siteParser, label);
    const location = requireArray(raw.location, label, `[${index}].location`);
    const lat = requireNumber(location[0], label, `[${index}].location[0]`);
    const lng = requireNumber(location[1], label, `[${index}].location[1]`);
    if (location.length !== 2 || Math.abs(lat) > 90 || Math.abs(lng) > 180)
      contentError(
        label,
        `[${index}].location`,
        "expected latitude and longitude on the globe",
      );
    if (site.organizations.length === 0)
      contentError(
        label,
        `[${index}].organizations`,
        "a site requires a resolved organization",
      );
    return { ...site, location: [lat, lng] };
  });
  if (new Set(sites.map((site) => site.id)).size !== sites.length)
    contentError(label, "id", "site identifiers must be unique");
  if (sites.length && sites.filter((site) => site.home).length !== 1)
    contentError(
      label,
      "home",
      "a nonempty globe requires exactly one home site",
    );
  return sites;
}
/** Read the optional published city collection; an empty collection stays empty. */
export async function getLabSiteList(): Promise<LabSite[]> {
  return loadContent<LabSite[], LAB_SITES_QUERY_RESULT>({
    query: LAB_SITES_QUERY,
    tags: ["content:labSite", "content:organization"],
    label: "the lab sites",
    select: selectLabSites,
  });
}
