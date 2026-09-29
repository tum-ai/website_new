import "server-only";

import { defineQuery } from "next-sanity";
import { type BackfillDocument, backfillId } from "./cms-backfill";
import { loadContent } from "./cms-content";
import { CONTENT_IMAGE_PROJECTION } from "./cms-content-model";
import {
  type Department,
  type DepartmentTemplate,
  groupJourneyStages,
  type JourneyStage,
  type JourneyStep,
  journeyIconKeys,
  stageSteps,
} from "./community-model";
import { backfillContentImage } from "./content-backfill";
import { fillCmsCopy, fillCodeCopy } from "./content-copy";
import type { ContentTokens } from "./content-tokens";
import { personId, personKey } from "./person-content";
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
  evidence{ "name": person->name, excerpt }
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

/** A step's evidence only when its person reference resolved to a name. */
function withResolvedEvidence<T extends Partial<JourneyStep>>({
  evidence,
  ...step
}: T): Omit<T, "evidence"> | T {
  return evidence?.name && evidence.excerpt ? { ...step, evidence } : step;
}

/**
 * The member journey: the CMS steps, grouped into stages by their stage
 * number, when the source is `sanity` and they form a journey the timetable
 * can draw; otherwise `journey`, the code journey. A step's evidence
 * references a member story's `person`; `people` are those documents for
 * the mock CMS (the member stories' backfill), and `storyKey` finds a
 * story's key by the quoted name (see {@link buildJourneyBackfill}).
 */
export function getMemberJourney(
  journey: readonly JourneyStage[],
  tokens: ContentTokens,
  {
    people = () => [],
    storyKey = personKey,
  }: {
    people?: () => readonly BackfillDocument[];
    storyKey?: (name: string) => string;
  } = {},
): Promise<JourneyStage[]> {
  return loadContent<JourneyStage[], JOURNEY_QUERY_RESULT>({
    fallback: fillCodeCopy([...journey], tokens),
    query: JOURNEY_QUERY,
    tags: ["content:journeyStep", "content:person"],
    label: "the member journey",
    mockDocuments: () => [
      ...buildJourneyBackfill(journey, storyKey),
      ...people(),
    ],
    select: (result) => {
      const filled = fillCmsCopy(result, tokens, "the member journey");
      const raw = Array.isArray(filled) ? filled : [];
      const steps = raw
        .map((step: Partial<JourneyStep>) => withResolvedEvidence(step))
        .filter(isJourneyStep);
      // The journey is structural: a dropped step (an unknown placeholder
      // or a missing field) would collapse the fork /apply draws its two
      // tracks from, so anything but the whole list keeps the code journey.
      const stages =
        steps.length === result.length ? groupJourneyStages(steps) : null;
      if (!stages?.some((stage) => stage.kind === "fork")) {
        if (result.length > 0) {
          console.warn(
            "[cms-content] The member journey needs every step complete, at most two steps per stage and one two-step fork; rendering the code journey.",
          );
        }
        return null;
      }
      return stages;
    },
  });
}

/** The core departments: the CMS list when there is one, otherwise `departments`. */
export function getDepartments(
  departments: readonly DepartmentTemplate[],
  tokens: ContentTokens,
): Promise<Department[]> {
  return loadContent<Department[], DEPARTMENTS_QUERY_RESULT>({
    fallback: fillCodeCopy(
      departments.map(({ key: _, ...department }) => department),
      tokens,
    ),
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

/**
 * The journey as `journeyStep` documents: one per step, with its stage. A
 * step's evidence references the member story's `person`, whose key
 * `storyKey` finds by the quoted name (the member stories slice passes
 * `memberStoryKey`, which reads the story's explicit key; the default
 * derives it from the name, for tests).
 */
export function buildJourneyBackfill(
  journey: readonly JourneyStage[],
  storyKey: (name: string) => string = personKey,
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
      ...(step.evidence
        ? {
            evidence: {
              person: {
                _type: "reference",
                _ref: personId("member-story", storyKey(step.evidence.name)),
              },
              excerpt: step.evidence.excerpt,
            },
          }
        : {}),
    }));
}

/** The departments as `department` documents, in order. */
export function buildDepartmentBackfill(
  departments: readonly DepartmentTemplate[],
): BackfillDocument[] {
  return departments.map(
    ({ key, name, description, photo, photoCaption }, index) => ({
      _id: backfillId("department", key),
      _type: "department",
      order: (index + 1) * 10,
      name,
      description,
      ...(photo ? { photo: backfillContentImage(photo) } : {}),
      ...(photoCaption ? { photoCaption } : {}),
    }),
  );
}
