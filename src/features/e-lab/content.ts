import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { CONTENT_IMAGE_PROJECTION } from "@/lib/cms-content-model";
import { backfillContentImage } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import { buildFaqBackfill, type FaqEntry, getFaqs } from "@/lib/faq-content";
import type { ELAB_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { type ELabCopy, eLabCopyTemplate, eLabPageTokens } from "./data/copy";
import { faqTemplates } from "./data/faq";
import type { GateFigure, StageCopy } from "./data/selection";

/**
 * The /e-lab content slice: what the page reads through the CMS content
 * source (`lib/cms-content.ts`): the FAQ (`faq`, collection `e-lab`) and
 * the `eLabCopy` singleton (hero, the gates and phases of a cohort, the
 * section headings and the closing). The gates' figures are site facts
 * (`facts.eLab.selection`); the code fallbacks are in `data/`.
 */

/** The /e-lab FAQ: the CMS `e-lab` collection, or the code list. */
export async function getELabFaqs(): Promise<FaqEntry[]> {
  return getFaqs("e-lab", {
    templates: faqTemplates,
    tokens: await getContentTokens(),
  });
}

export const ELAB_COPY_QUERY = defineQuery(`*[_id == "eLabCopy"][0]{
  hero{ title, lead },
  gates{
    title,
    lead,
    scaleLabel,
    stages[]{
      _type,
      figure,
      name,
      description,
      approximate,
      "id": key,
      duration,
      "photo": photo${CONTENT_IMAGE_PROJECTION},
      photoCaption
    }
  },
  field{ caption, inviteLabel },
  ventures{ title, fundingNote, logosLabel },
  voices{ title, lead, foundersLabel, investorsLabel },
  closing{ title, followLabel, partnersReader, partnersText }
}`);

const figures: readonly unknown[] = [
  "applications",
  "admitted",
  "midterm",
  "selectionDay",
  "finalPitch",
] satisfies GateFigure[];

type RawStage = Partial<Record<string, unknown>> & { _type?: string };

/** A CMS stage as the code writes it, or `null` when it is incomplete. */
function toStage({ _type, ...stage }: RawStage): StageCopy | null {
  if (_type === "gateStage") {
    const { figure, name, description, approximate } = stage;
    if (!figures.includes(figure) || !name || !description) return null;
    return {
      kind: "gate",
      figure: figure as GateFigure,
      name: String(name),
      description: String(description),
      ...(approximate === true ? { approximate } : {}),
    };
  }
  if (_type === "phaseStage") {
    const { id, name, duration, description, photo, photoCaption } = stage;
    if (!id || !name || !duration || !description) return null;
    return {
      kind: "phase",
      id: String(id),
      name: String(name),
      duration: String(duration),
      description: String(description),
      ...(photo ? { photo: photo as never } : {}),
      ...(photo && photoCaption ? { photoCaption: String(photoCaption) } : {}),
    };
  }
  return null;
}

/** The /e-lab copy: the CMS `eLabCopy` over the code copy. */
export async function getELabCopy(): Promise<ELabCopy> {
  const tokens = await getContentTokens();
  return loadContent<ELabCopy, ELAB_COPY_QUERY_RESULT>({
    fallback: fillCodeCopy(eLabCopyTemplate, tokens, eLabPageTokens),
    query: ELAB_COPY_QUERY,
    tags: ["content:eLabCopy"],
    label: "the /e-lab copy",
    mockDocuments: buildELabBackfill,
    select: (result) => {
      const copy = fillCmsCopy(
        result,
        tokens,
        "the /e-lab copy",
        eLabPageTokens,
      ) as {
        gates?: { stages?: RawStage[] };
      } | null;
      if (!copy?.gates) return copy;
      const stages = (copy.gates.stages ?? []).map(toStage);
      return {
        ...copy,
        gates: {
          ...copy.gates,
          // An incomplete stage drops the whole list, so the code cohort
          // shows: a missing gate would skew the drawing.
          stages: stages.every(Boolean) ? stages : [],
        },
      };
    },
  });
}

/** The /e-lab FAQ and copy as documents for `pnpm sanity:backfill`. */
export function buildELabBackfill(): BackfillDocument[] {
  const { gates, ...copy } = eLabCopyTemplate;
  return [
    ...buildFaqBackfill("e-lab", faqTemplates),
    {
      _id: "eLabCopy",
      _type: "eLabCopy",
      ...copy,
      gates: {
        ...gates,
        stages: gates.stages.map((stage) => {
          if (stage.kind === "gate") {
            const { kind: _, ...gate } = stage;
            return { _key: gate.figure, _type: "gateStage", ...gate };
          }
          const { kind: _, id, photo, ...phase } = stage;
          return {
            _key: id,
            _type: "phaseStage",
            key: id,
            ...phase,
            ...(photo ? { photo: backfillContentImage(photo) } : {}),
          };
        }),
      },
    },
  ];
}
