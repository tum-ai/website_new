import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  contentError,
  contentImage,
  contentObject,
  contentOptional,
  contentString,
  contentText,
  parseContent,
  requireArray,
  requireBoolean,
  requireEnum,
  requireObject,
  requireString,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import { type FaqEntry, getFaqs } from "@/lib/faq-content";
import { isDuration } from "@/lib/program-duration";
import type { ELAB_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { type ELabCopy, eLabPageTokens } from "./data/copy";
import type { GateFigure, StageCopy } from "./data/selection";

/** The published E-Lab FAQ collection; editors may remove every entry. */
export async function getELabFaqs(): Promise<FaqEntry[]> {
  return getFaqs("e-lab", { tokens: await getContentTokens() });
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
      duration{ amount, unit },
      "photo": photo${CONTENT_IMAGE_PROJECTION},
      photoCaption
    }
  },
  field{ caption, inviteLabel },
  ventures{ title, fundingNote, logosLabel },
  voices{ title, lead, foundersLabel, investorsLabel },
  closing{ title, followLabel, partnersReader, partnersText }
}`);

const figures = [
  "applications",
  "admitted",
  "midterm",
  "selectionDay",
  "finalPitch",
] as const satisfies readonly GateFigure[];
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
          name: requireString(stage.name, label, `${path}.name`),
          description: requireString(
            stage.description,
            label,
            `${path}.description`,
          ),
          ...(stage.approximate == null
            ? {}
            : {
                approximate: requireBoolean(
                  stage.approximate,
                  label,
                  `${path}.approximate`,
                ),
              }),
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
    logosLabel: contentString,
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
export function selectELabCopy(value: unknown): ELabCopy {
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
