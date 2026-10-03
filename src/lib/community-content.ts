import "server-only";

import { defineQuery } from "next-sanity";
import { loadContent } from "./cms-content";
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
  requireArray,
  requireEnum,
  requireNumber,
  requireObject,
  requireString,
} from "./cms-content-model";
import {
  type Department,
  groupJourneyStages,
  type JourneyStage,
  type JourneyStep,
  journeyIconKeys,
} from "./community-model";
import { fillCmsCopy } from "./content-copy";
import type { ContentTokens } from "./content-tokens";
import { isExcerptOf } from "./quote-excerpt";
import type {
  DEPARTMENTS_QUERY_RESULT,
  JOURNEY_QUERY_RESULT,
} from "./sanity.types.generated";

export const JOURNEY_QUERY =
  defineQuery(`*[_type == "journeyStep"] | order(order asc){
  "step": number, name, description, iconKey, fromSemester, span, stage,
  evidence{ "key": person->key, "name": person->name, "story": person->story, "placement": person->placement, excerpt }
}`);

export const DEPARTMENTS_QUERY =
  defineQuery(`*[_type == "department"] | order(order asc){
  name, description, "photo": photo${CONTENT_IMAGE_PROJECTION}, photoCaption
}`);

/** A quote is attributable only to a resolved member story that contains its words. */
export function parseMemberEvidence(
  value: unknown,
  label: string,
  path = "evidence",
): JourneyStep["evidence"] {
  if (value == null) return undefined;
  const quote = requireObject(value, label, path);
  const key = requireString(quote.key, label, `${path}.key`);
  const name = requireString(quote.name, label, `${path}.name`);
  const excerpt = requireString(quote.excerpt, label, `${path}.excerpt`);
  const story = requireString(quote.story, label, `${path}.story`);
  if (quote.placement !== "member-story" || !isExcerptOf(excerpt, story)) {
    return contentError(
      label,
      path,
      "must quote its resolved member story word for word",
    );
  }
  return { key, name, excerpt };
}

/** Validate the complete structural journey before any page can derive its tracks. */
export function selectMemberJourney(value: unknown): JourneyStage[] {
  const label = "the member journey";
  const steps = requireArray(value, label).map((raw, index) => {
    const path = `[${index}]`;
    const record = requireObject(raw, label, path);
    const step = requireString(record.step, label, `${path}.step`);
    if (!/^\d{2}[A-Z]?$/.test(step))
      contentError(label, `${path}.step`, "invalid step anchor");
    const stage = requireNumber(record.stage, label, `${path}.stage`);
    const fromSemester = requireNumber(
      record.fromSemester,
      label,
      `${path}.fromSemester`,
    );
    if (!Number.isInteger(stage) || stage < 1)
      contentError(label, `${path}.stage`, "must be a positive integer");
    if (!Number.isInteger(fromSemester) || fromSemester < 0 || fromSemester > 6)
      contentError(
        label,
        `${path}.fromSemester`,
        "must be an integer from 0 to 6",
      );
    const evidence = parseMemberEvidence(
      record.evidence,
      label,
      `${path}.evidence`,
    );
    return {
      step,
      stage,
      fromSemester,
      name: requireString(record.name, label, `${path}.name`),
      description: requireString(
        record.description,
        label,
        `${path}.description`,
      ),
      iconKey: requireEnum(
        record.iconKey,
        journeyIconKeys,
        label,
        `${path}.iconKey`,
      ),
      span: requireEnum(
        record.span,
        ["event", "ongoing"] as const,
        label,
        `${path}.span`,
      ),
      ...(evidence ? { evidence } : {}),
    };
  });
  const seenSteps = new Set<string>();
  const seenStages = new Set<number>();
  let previousStage: number | undefined;
  for (const step of steps) {
    if (seenSteps.has(step.step))
      contentError(label, "step", "step anchors must be unique");
    seenSteps.add(step.step);
    if (step.stage !== previousStage && seenStages.has(step.stage))
      contentError(
        label,
        "stage",
        "steps of a stage must remain adjacent in editorial order",
      );
    seenStages.add(step.stage);
    previousStage = step.stage;
  }
  const stages = groupJourneyStages(steps);
  if (stages?.filter((stage) => stage.kind === "fork").length !== 1) {
    return contentError(
      label,
      "stage",
      "requires one two-step fork and at most two steps per stage",
    );
  }
  return stages;
}

/** Published journey; missing structure and invalid quotes fail visibly. */
export function getMemberJourney(
  tokens: ContentTokens,
): Promise<JourneyStage[]> {
  return loadContent<JourneyStage[], JOURNEY_QUERY_RESULT>({
    query: JOURNEY_QUERY,
    tags: ["content:journeyStep", "content:person"],
    label: "the member journey",
    select: (result) =>
      selectMemberJourney(fillCmsCopy(result, tokens, "the member journey")),
  });
}

const departmentParser = contentArray(
  contentObject({
    name: contentString,
    description: contentString,
    photo: contentOptional(contentImage),
    photoCaption: contentOptional(contentText),
  }),
);

/** Published departments; an editor may clear the complete collection. */
export function getDepartments(tokens: ContentTokens): Promise<Department[]> {
  return loadContent<Department[], DEPARTMENTS_QUERY_RESULT>({
    query: DEPARTMENTS_QUERY,
    tags: ["content:department"],
    label: "the departments",
    select: (result) =>
      parseContent(
        fillCmsCopy(result, tokens, "the departments"),
        departmentParser,
        "the departments",
      ),
  });
}
