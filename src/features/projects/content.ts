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
  requireArray,
  requireObject,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import type { PROJECTS_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { type ProjectsCopy, projectsPageTokens } from "./data/copy";
import { openSeatSlug, type TaskForce } from "./data/projects";

const PROJECTS_CONTENT_QUERY = defineQuery(`{
  "copy": *[_id == "projectsCopy"][0]{
    hero{ eyebrow, title, lead, figureLabel },
    openSeat{ name, field },
    closing{
      title,
      lead,
      student{ audience, text },
      partner{ audience, text, textWithoutPartner }
    }
  },
  "taskForces": *[_type == "taskForce"] | order(order asc){
    "slug": slug.current,
    name,
    field,
    description,
    detailedDescription,
    work{ "partner": partner->name, items },
    "photo": photo${CONTENT_IMAGE_PROJECTION},
    photoCaption
  }
}`);

/** Complete CMS content consumed by the projects page. */
export type ProjectsContent = { copy: ProjectsCopy; taskForces: TaskForce[] };
const audience = contentObject({
  audience: contentString,
  text: contentString,
});
const copyParser = contentObject({
  hero: contentObject({
    eyebrow: contentString,
    title: contentString,
    lead: contentString,
    figureLabel: contentString,
  }),
  openSeat: contentObject({ name: contentString, field: contentString }),
  closing: contentObject({
    title: contentString,
    lead: contentString,
    student: audience,
    partner: contentObject({
      audience: contentString,
      text: contentString,
      textWithoutPartner: contentString,
    }),
  }),
});
const forceParser = contentObject({
  slug: contentString,
  name: contentString,
  field: contentString,
  description: contentString,
  detailedDescription: contentString,
  work: contentOptional(
    contentObject({
      partner: contentString,
      items: contentArray(contentString),
    }),
  ),
  photo: contentOptional(contentImage),
  photoCaption: contentOptional(contentText),
});
/** Validate every selected field; a removed optional collection remains empty. */
export function selectProjectsContent(value: unknown): ProjectsContent {
  const label = "the /projects content";
  const result = requireObject(value, label);
  const forces = requireArray(result.taskForces, label, "taskForces").map(
    (force) => parseContent(force, forceParser, label),
  );
  const seen = new Set<string>();
  for (const force of forces) {
    if (
      !/^[a-z0-9-]+$/.test(force.slug) ||
      force.slug === openSeatSlug ||
      seen.has(force.slug)
    )
      contentError(
        label,
        "taskForces.slug",
        "anchors must be unique and cannot use the open circle anchor",
      );
    if (
      force.work &&
      (force.work.items.length < 1 || force.work.items.length > 8)
    )
      contentError(
        label,
        "taskForces.work.items",
        "expected one to eight named projects",
      );
    seen.add(force.slug);
  }
  return {
    copy: parseContent(result.copy, copyParser, label),
    taskForces: forces,
  };
}
/** Read the published page singleton and optional task-force collection. */
export async function getProjectsContent(): Promise<ProjectsContent> {
  const tokens = await getContentTokens();
  return loadContent<ProjectsContent, PROJECTS_CONTENT_QUERY_RESULT>({
    query: PROJECTS_CONTENT_QUERY,
    tags: ["content:projectsCopy", "content:taskForce", "content:organization"],
    label: "the /projects content",
    select: (result) =>
      selectProjectsContent(
        fillCmsCopy(
          result,
          tokens,
          "the /projects content",
          projectsPageTokens,
        ),
      ),
  });
}
