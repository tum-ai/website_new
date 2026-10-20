import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  type ContentParser,
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
  requireEnum,
  requireObject,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import { type FaqEntry, getFaqs } from "@/lib/faq-content";
import { isDuration } from "@/lib/program-duration";
import type { ELAB_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  type ELabCopy,
  eLabInvolveKeys,
  eLabPageTokens,
  type FounderRow,
} from "./data/copy";
import type { GateFigure, StageCopy } from "./data/selection";

/** The published E-Lab FAQ collection; editors may remove every entry. */
export async function getELabFaqs(): Promise<FaqEntry[]> {
  return getFaqs("e-lab", { tokens: await getContentTokens() });
}

const ELAB_COPY_QUERY = defineQuery(`*[_id == "eLabCopy"][0]{
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
      atLeast,
      "photos": photos[]{ "image": image${CONTENT_IMAGE_PROJECTION}, caption },
      "id": key,
      duration{ amount, unit },
      "photo": photo${CONTENT_IMAGE_PROJECTION},
      photoCaption
    }
  },
  field{ caption, inviteLabel },
  ventures{
    title,
    fundingNote,
    foundersTitle,
    founders[]{
      "key": venture->key,
      "name": venture->name,
      "href": venture->href,
      edition,
      summary,
      metrics[]{ value, label },
      backedBy{ name, note }
    }
  },
  partners{ title, lead, iterationLabel, workshopLabel, pastLabel },
  involve{ eyebrow, title, lead, options[]{ key, title, detail } },
  voices{ title, lead, foundersLabel, investorsLabel },
  closing{ title, followLabel, partnersReader, partnersText }
}`);

const figures = [
  "applications",
  "admitted",
  "midterm",
  "finalPitch",
] as const satisfies readonly GateFigure[];
const gatePhotoParser = contentObject({
  image: contentImage,
  caption: contentOptional(contentText),
});
const phaseParser = contentObject({
  id: contentString,
  name: contentString,
  description: contentString,
  photo: contentOptional(contentImage),
  photoCaption: contentOptional(contentText),
});
/** Validate the complete structural funnel, including every phase. */
export function selectStages(value: unknown): StageCopy[] {
  const label = "the /e-lab copy";
  const stages = requireArray(value, label, "gates.stages").map(
    (value, index): StageCopy => {
      const path = `gates.stages[${index}]`;
      const stage = requireObject(value, label, path);
      const kind = requireEnum(
        stage._type,
        ["gateStage", "phaseStage"] as const,
        label,
        `${path}._type`,
      );
      if (kind === "gateStage")
        return {
          kind: "gate",
          figure: requireEnum(stage.figure, figures, label, `${path}.figure`),
          name: contentString(stage.name, label, `${path}.name`),
          description: contentString(
            stage.description,
            label,
            `${path}.description`,
          ),
          ...(stage.approximate == null
            ? {}
            : {
                approximate: contentBoolean(
                  stage.approximate,
                  label,
                  `${path}.approximate`,
                ),
              }),
          ...(stage.atLeast
            ? {
                atLeast: contentBoolean(
                  stage.atLeast,
                  label,
                  `${path}.atLeast`,
                ),
              }
            : {}),
          ...(Array.isArray(stage.photos) && stage.photos.length > 0
            ? {
                photos: contentArray(gatePhotoParser)(
                  stage.photos,
                  label,
                  `${path}.photos`,
                ).map(({ image, caption }) => ({
                  image,
                  ...(caption ? { caption } : {}),
                })),
              }
            : {}),
        };
      if (!isDuration(stage.duration))
        contentError(
          label,
          `${path}.duration`,
          "expected a positive duration in days or weeks",
        );
      return {
        kind: "phase",
        ...parseContent(stage, phaseParser, label),
        duration: { amount: stage.duration.amount, unit: stage.duration.unit },
      };
    },
  );
  const gates = stages.flatMap((stage) =>
    stage.kind === "gate" ? [stage.figure] : [],
  );
  if (
    stages[0]?.kind !== "gate" ||
    stages.at(-1)?.kind !== "gate" ||
    gates.length !== figures.length ||
    figures.some((figure, index) => figure !== gates[index])
  )
    contentError(
      label,
      "gates.stages",
      "every gate figure is required once, in funnel order, with phases between gates",
    );
  const ids = stages.map((stage) =>
    stage.kind === "gate"
      ? stage.figure.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      : stage.id,
  );
  if (new Set(ids).size !== ids.length)
    contentError(label, "gates.stages", "stage identifiers must be unique");
  return stages;
}
/** A founders row: its venture must resolve and carry at most four figures. */
const founderParser: ContentParser<FounderRow> = (value, label, path) => {
  const row = contentObject({
    key: contentString,
    name: contentString,
    href: contentOptional(contentString),
    edition: contentOptional(contentString),
    summary: contentString,
    metrics: contentArray(
      contentObject({ value: contentString, label: contentString }),
    ),
    backedBy: contentOptional(
      contentObject({
        name: contentString,
        note: contentOptional(contentString),
      }),
    ),
  })(value, label, path);
  if (row.metrics.length > 4)
    contentError(label, `${path}.metrics`, "at most four figures fit a row");
  const { href, edition, backedBy, ...rest } = row;
  return {
    ...rest,
    ...(href ? { href } : {}),
    ...(edition ? { edition } : {}),
    ...(backedBy
      ? {
          backedBy: {
            name: backedBy.name,
            ...(backedBy.note ? { note: backedBy.note } : {}),
          },
        }
      : {}),
  };
};
const copyParser = contentObject({
  hero: contentObject({ title: contentString, lead: contentString }),
  gates: contentObject({
    title: contentString,
    lead: contentString,
    scaleLabel: contentString,
    stages: (value) => selectStages(value),
  }),
  field: contentObject({ caption: contentString, inviteLabel: contentString }),
  ventures: contentObject({
    title: contentString,
    fundingNote: contentString,
    foundersTitle: contentString,
    founders: contentArray(founderParser),
  }),
  partners: contentObject({
    title: contentString,
    lead: contentString,
    iterationLabel: contentString,
    workshopLabel: contentString,
    pastLabel: contentString,
  }),
  involve: contentObject({
    eyebrow: contentString,
    title: contentString,
    lead: contentString,
    options: contentArray(
      contentObject({
        key: (value: unknown, label: string, path: string) =>
          requireEnum(value, eLabInvolveKeys, label, path),
        title: contentString,
        detail: contentString,
      }),
    ),
  }),
  voices: contentObject({
    title: contentString,
    lead: contentString,
    foundersLabel: contentString,
    investorsLabel: contentString,
  }),
  closing: contentObject({
    title: contentString,
    followLabel: contentString,
    partnersReader: contentString,
    partnersText: contentString,
  }),
});
/** Reject missing or malformed required copy before it reaches the page. */
function selectELabCopy(value: unknown): ELabCopy {
  return parseContent(value, copyParser, "the /e-lab copy");
}
/** Read the required published E-Lab copy singleton. */
export async function getELabCopy(): Promise<ELabCopy> {
  const tokens = await getContentTokens();
  return loadContent<ELabCopy, ELAB_COPY_QUERY_RESULT>({
    query: ELAB_COPY_QUERY,
    tags: ["content:eLabCopy"],
    label: "the /e-lab copy",
    select: (result) =>
      selectELabCopy(
        fillCmsCopy(result, tokens, "the /e-lab copy", eLabPageTokens),
      ),
  });
}
