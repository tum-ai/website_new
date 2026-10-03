import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  contentArray,
  contentError,
  contentImage,
  contentObject,
  contentOptional,
  contentString,
  contentText,
  parseContent,
  requireEnum,
  requireNumber,
} from "@/lib/cms-content-model";
import { getMemberJourney } from "@/lib/community-content";
import type { JourneyStage } from "@/lib/community-model";
import { fillCmsCopy } from "@/lib/content-copy";
import { type FaqEntry, getFaqs } from "@/lib/faq-content";
import type { APPLY_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { type ApplyCopy, applyPageTokens, stageTimings } from "./data/apply";
import { type Milestone, milestoneKinds } from "./data/milestones";

/** Published application FAQs; no code FAQ can replenish deleted entries. */
export async function getApplyFaqs(): Promise<FaqEntry[]> {
  return getFaqs("apply", { tokens: await getContentTokens() });
}

export const APPLY_CONTENT_QUERY = defineQuery(`{
  "copy": *[_id == "applyCopy"][0]{
    heroTitle,
    heroLead,
    faqLabel,
    datesTitle,
    scope{
      title,
      inScopeTitle,
      notRequiredTitle,
      valuesTitle,
      qualities[]{ title, text },
      notRequired[]{ title, text },
      values[]{ title, text },
      "photo": photo${CONTENT_IMAGE_PROJECTION}
    },
    tracks{
      title,
      lead,
      offeringsTitle,
      offerings[]{ title, text },
      "photo": photo${CONTENT_IMAGE_PROJECTION},
      journeyLink
    },
    selection{ title, lead, stages[]{ title, when, text } },
    history{ title, lead },
    closing{ companiesReader }
  },
  "milestones": *[_type == "milestone"] | order(year asc, order asc){
    year,
    kind,
    title,
    detail
  }
}`);

/** Validated application copy with optional historical milestones and a required journey. */
export type ApplyContent = {
  copy: ApplyCopy;
  milestones: Milestone[];
  journey: JourneyStage[];
};
const point = contentObject({ title: contentString, text: contentString });
const points = contentArray(point);
const applyCopyParser = contentObject({
  heroTitle: contentString,
  heroLead: contentString,
  faqLabel: contentString,
  datesTitle: contentString,
  scope: contentObject({
    title: contentString,
    inScopeTitle: contentString,
    notRequiredTitle: contentString,
    valuesTitle: contentString,
    qualities: points,
    notRequired: points,
    values: points,
    photo: contentImage,
  }),
  tracks: contentObject({
    title: contentString,
    lead: contentString,
    offeringsTitle: contentString,
    offerings: points,
    photo: contentImage,
    journeyLink: contentString,
  }),
  selection: contentObject({
    title: contentString,
    lead: contentString,
    stages: contentArray(
      contentObject({
        title: contentString,
        text: contentString,
        when: (value, label, path) =>
          requireEnum(value, stageTimings, label, path),
      }),
    ),
  }),
  history: contentObject({ title: contentString, lead: contentString }),
  closing: contentObject({ companiesReader: contentString }),
});
const milestoneParser = contentArray(
  contentObject({
    year: (value, label, path) => {
      const year = requireNumber(value, label, path);
      if (!Number.isInteger(year) || year < 2020 || year > 2100)
        return contentError(
          label,
          path,
          "must be an integer year from 2020 to 2100",
        );
      return year;
    },
    kind: (value, label, path) =>
      requireEnum(
        value,
        milestoneKinds.map(({ id }) => id),
        label,
        path,
      ),
    title: contentString,
    detail: contentOptional(contentText),
  }),
);

/** Validate the whole singleton before sections dereference their required fields. */
export function selectApplyContent(
  value: unknown,
): Omit<ApplyContent, "journey"> {
  const parsed = parseContent(
    value,
    contentObject({ copy: applyCopyParser, milestones: milestoneParser }),
    "the /apply content",
  );
  for (const [path, list, min, max] of [
    ["scope.qualities", parsed.copy.scope.qualities, 2, 6],
    ["scope.notRequired", parsed.copy.scope.notRequired, 1, 4],
    ["scope.values", parsed.copy.scope.values, 2, 4],
    ["tracks.offerings", parsed.copy.tracks.offerings, 1, 3],
    ["selection.stages", parsed.copy.selection.stages, 1, 6],
  ] as const) {
    if (list.length < min || list.length > max)
      contentError(
        "the /apply content",
        path,
        `requires ${min} to ${max} entries`,
      );
    if (new Set(list.map(({ title }) => title)).size !== list.length)
      contentError("the /apply content", path, "titles must be unique");
  }
  const cells = new Set<string>();
  for (const milestone of parsed.milestones) {
    const key = `${milestone.year}:${milestone.title}`;
    if (cells.has(key))
      contentError(
        "the /apply content",
        "milestones",
        "titles must be unique within a year",
      );
    cells.add(key);
  }
  return parsed;
}

/** Published application content. Empty optional lists remain empty. */
export async function getApplyContent(): Promise<ApplyContent> {
  const tokens = await getContentTokens();
  const [content, journey] = await Promise.all([
    loadContent<Omit<ApplyContent, "journey">, APPLY_CONTENT_QUERY_RESULT>({
      query: APPLY_CONTENT_QUERY,
      tags: ["content:applyCopy", "content:milestone"],
      label: "the /apply content",
      select: (result) =>
        selectApplyContent(
          fillCmsCopy(result, tokens, "the /apply content", applyPageTokens),
        ),
    }),
    getMemberJourney(tokens),
  ]);
  return { ...content, journey };
}
