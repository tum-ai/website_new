import "server-only";

import { defineQuery } from "next-sanity";
import { type BackfillDocument, backfillId } from "./cms-backfill";
import { loadContent } from "./cms-content";
import { CONTENT_IMAGE_PROJECTION } from "./cms-content-model";
import {
  type Department,
  groupJourneyStages,
  type JourneyStage,
  type JourneyStep,
  journeyIconKeys,
  stageSteps,
} from "./community-model";
import { backfillContentImage } from "./content-backfill";
import { fillCmsCopy, fillCodeCopy } from "./content-copy";
import type { ContentTokens } from "./content-tokens";
import type {
  DEPARTMENTS_QUERY_RESULT,
  JOURNEY_QUERY_RESULT,
} from "./sanity.types.generated";

/**
 * The community content several pages read (`journeyStep`, `department`):
 * /community renders both, /apply the journey's tracks, the homepage the
 * department count. Shared like `faq-content.ts`: each page passes the code
 * fallback from `features/community` (through its index) and the
 * placeholder values, so `lib` imports no feature.
 */

export const JOURNEY_QUERY =
  defineQuery(`*[_type == "journeyStep"] | order(order asc){
  "step": number,
  name,
  description,
  iconKey,
  fromSemester,
  span,
  stage,
  evidence{ name, excerpt }
}`);

export const DEPARTMENTS_QUERY =
  defineQuery(`*[_type == "department"] | order(order asc){
  name,
  description,
  "photo": photo${CONTENT_IMAGE_PROJECTION},
  photoCaption
}`);

const isJourneyStep = (
  step: unknown,
): step is JourneyStep & { stage: number } => {
  const value = (step ?? {}) as Partial<JourneyStep & { stage: number }>;
  return Boolean(
    value.step &&
      value.name &&
      value.description &&
      (journeyIconKeys as readonly unknown[]).includes(value.iconKey) &&
      typeof value.fromSemester === "number" &&
      (value.span === "event" || value.span === "ongoing") &&
      typeof value.stage === "number",
  );
};

/**
 * The member journey: the CMS steps, grouped into stages by their stage
 * number, when the source is `sanity` and they form a journey the timetable
 * can draw; otherwise `journey`, the code journey.
 */
export function getMemberJourney(
  journey: readonly JourneyStage[],
  tokens: ContentTokens,
): Promise<JourneyStage[]> {
  return loadContent<JourneyStage[], JOURNEY_QUERY_RESULT>({
    fallback: fillCodeCopy([...journey], tokens),
    query: JOURNEY_QUERY,
    tags: ["content:journeyStep"],
    label: "the member journey",
    mockDocuments: () => buildJourneyBackfill(journey),
    select: (result) => {
      const filled = fillCmsCopy(result, tokens, "the member journey");
      const steps = (Array.isArray(filled) ? filled : []).filter(isJourneyStep);
      const stages = groupJourneyStages(steps);
      if (!stages) {
        console.warn(
          "[cms-content] The member journey has a stage with more than two steps; rendering the code journey.",
        );
      }
      return stages ?? null;
    },
  });
}

/** The core departments: the CMS list when there is one, otherwise `departments`. */
export function getDepartments(
  departments: readonly Department[],
  tokens: ContentTokens,
): Promise<Department[]> {
  return loadContent<Department[], DEPARTMENTS_QUERY_RESULT>({
    fallback: fillCodeCopy([...departments], tokens),
    query: DEPARTMENTS_QUERY,
    tags: ["content:department"],
    label: "the departments",
    mockDocuments: () => buildDepartmentBackfill(departments),
    select: (result) => {
      const filled = fillCmsCopy(result, tokens, "the departments");
      return (Array.isArray(filled) ? filled : []).filter(
        (department: Partial<Department>) =>
          department.name && department.description,
      );
    },
  });
}

/** The journey as `journeyStep` documents: one per step, with its stage. */
export function buildJourneyBackfill(
  journey: readonly JourneyStage[],
): BackfillDocument[] {
  return journey
    .flatMap((stage, stageIndex) =>
      stageSteps(stage).map((step) => ({ step, stage: stageIndex + 1 })),
    )
    .map(({ step, stage }, index) => ({
      _id: backfillId("journey-step", step.step),
      _type: "journeyStep",
      order: (index + 1) * 10,
      stage,
      number: step.step,
      name: step.name,
      description: step.description,
      iconKey: step.iconKey,
      fromSemester: step.fromSemester,
      span: step.span,
      ...(step.evidence ? { evidence: { ...step.evidence } } : {}),
    }));
}

/** The departments as `department` documents, in order. */
export function buildDepartmentBackfill(
  departments: readonly Department[],
): BackfillDocument[] {
  return departments.map(
    ({ name, description, photo, photoCaption }, index) => ({
      _id: backfillId("department", name),
      _type: "department",
      order: (index + 1) * 10,
      name,
      description,
      ...(photo ? { photo: backfillContentImage(photo) } : {}),
      ...(photoCaption ? { photoCaption } : {}),
    }),
  );
}
