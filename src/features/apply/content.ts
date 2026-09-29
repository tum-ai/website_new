import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { memberJourney } from "@/features/community";
import { type BackfillDocument, backfillId } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { CONTENT_IMAGE_PROJECTION } from "@/lib/cms-content-model";
import { getMemberJourney } from "@/lib/community-content";
import type { JourneyStage } from "@/lib/community-model";
import { backfillContentImage, keyedItems } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import { buildFaqBackfill, type FaqEntry, getFaqs } from "@/lib/faq-content";
import type { APPLY_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  type ApplyCopy,
  applyCopyTemplate,
  applyPageTokens,
  type Point,
  stageTimings,
} from "./data/apply";
import { faqTemplates } from "./data/faq";
import { type Milestone, milestoneKinds, milestones } from "./data/milestones";

/**
 * The /apply content slice: what the page reads through the CMS content
 * source (`lib/cms-content.ts`): the FAQ (`faq`, collection `apply`), the
 * `applyCopy` singleton, the `milestone` documents and the member journey's
 * tracks (shared with /community, `lib/community-content.ts`). The code
 * fallbacks are in `data/` and the community feature.
 */

/** The /apply FAQ: the CMS `apply` collection, or the code list. */
export async function getApplyFaqs(): Promise<FaqEntry[]> {
  return getFaqs("apply", {
    templates: faqTemplates,
    tokens: await getContentTokens(),
  });
}

export const APPLY_CONTENT_QUERY = defineQuery(`{
  "copy": *[_id == "applyCopy"][0]{
    heroLead,
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
    history{ title, lead }
  },
  "milestones": *[_type == "milestone"] | order(year asc, order asc){
    year,
    kind,
    title,
    detail
  }
}`);

/**
 * Everything /apply renders from the slice besides the FAQ: site-fact
 * placeholders filled, the page tokens left for the sections.
 */
export type ApplyContent = {
  copy: ApplyCopy;
  milestones: Milestone[];
  /** The member journey; /apply shows its fork's two tracks. */
  journey: JourneyStage[];
};

const isPoint = (value: unknown): value is Point => {
  const { title, text } = (value ?? {}) as Partial<Point>;
  return Boolean(title && text);
};

const kinds: readonly unknown[] = milestoneKinds.map(({ id }) => id);

const isMilestone = (value: unknown): value is Milestone => {
  const { year, kind, title } = (value ?? {}) as Partial<Milestone>;
  return Number.isInteger(year) && kinds.includes(kind) && Boolean(title);
};

type FilledCopy = {
  scope?: Record<string, unknown>;
  tracks?: Record<string, unknown>;
  selection?: Record<string, unknown>;
};

/** Drops incomplete list items from a filled CMS copy. */
function selectCopy(copy: (FilledCopy & Record<string, unknown>) | null) {
  if (!copy) return null;
  const points = (list: unknown) =>
    Array.isArray(list) ? list.filter(isPoint) : [];
  return {
    ...copy,
    scope: copy.scope && {
      ...copy.scope,
      qualities: points(copy.scope.qualities),
      notRequired: points(copy.scope.notRequired),
      values: points(copy.scope.values),
    },
    tracks: copy.tracks && {
      ...copy.tracks,
      offerings: points(copy.tracks.offerings),
    },
    selection: copy.selection && {
      ...copy.selection,
      stages: points(copy.selection.stages).filter((stage) =>
        (stageTimings as readonly unknown[]).includes(
          (stage as { when?: unknown }).when,
        ),
      ),
    },
  };
}

/** The /apply copy, milestones and journey: the CMS over the code copy. */
export async function getApplyContent(): Promise<ApplyContent> {
  const tokens = await getContentTokens();
  const [content, journey] = await Promise.all([
    loadContent<Omit<ApplyContent, "journey">, APPLY_CONTENT_QUERY_RESULT>({
      fallback: {
        copy: fillCodeCopy(applyCopyTemplate, tokens, applyPageTokens),
        milestones: fillCodeCopy(milestones, tokens),
      },
      query: APPLY_CONTENT_QUERY,
      tags: ["content:applyCopy", "content:milestone"],
      label: "the /apply content",
      mockDocuments: buildApplyBackfill,
      select: (result) => {
        const filled = fillCmsCopy(result.milestones, tokens, "the milestones");
        return {
          copy: selectCopy(
            fillCmsCopy(
              result.copy,
              tokens,
              "the /apply copy",
              applyPageTokens,
            ) as (FilledCopy & Record<string, unknown>) | null,
          ),
          milestones: (Array.isArray(filled) ? filled : []).filter(isMilestone),
        };
      },
    }),
    getMemberJourney(memberJourney, tokens),
  ]);
  return { ...content, journey };
}

/**
 * The /apply FAQ, copy and milestones as documents for
 * `pnpm sanity:backfill` (the journey is the community slice's).
 */
export function buildApplyBackfill(): BackfillDocument[] {
  const { scope, tracks, selection, ...copy } = applyCopyTemplate;
  return [
    ...buildFaqBackfill("apply", faqTemplates),
    {
      _id: "applyCopy",
      _type: "applyCopy",
      ...copy,
      scope: {
        ...scope,
        qualities: keyedItems("point", scope.qualities),
        notRequired: keyedItems("point", scope.notRequired),
        values: keyedItems("point", scope.values),
        photo: backfillContentImage(scope.photo),
      },
      tracks: {
        ...tracks,
        offerings: keyedItems("point", tracks.offerings),
        photo: backfillContentImage(tracks.photo),
      },
      selection: {
        ...selection,
        stages: keyedItems(
          "selectionStage",
          selection.stages,
          ({ when }) => when,
        ),
      },
    },
    ...milestones.map((milestone, index) => ({
      _id: backfillId("milestone", milestone.year, milestone.title),
      _type: "milestone",
      order: (index + 1) * 10,
      ...milestone,
    })),
  ];
}
