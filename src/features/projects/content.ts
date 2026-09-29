import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { type BackfillDocument, backfillId } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { CONTENT_IMAGE_PROJECTION } from "@/lib/cms-content-model";
import { backfillContentImage } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import type { PROJECTS_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  type ProjectsCopy,
  projectsCopyTemplate,
  projectsPageTokens,
} from "./data/copy";
import { type TaskForce, taskForces } from "./data/projects";

/**
 * The /projects content slice: the `projectsCopy` singleton (hero, open
 * seat, closing) and the `taskForce` documents. The figure's geometry stays
 * in code (`overlaps.ts`); the code fallbacks are in `data/`.
 */

export const PROJECTS_CONTENT_QUERY = defineQuery(`{
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
    work{ partner, items },
    "photo": photo${CONTENT_IMAGE_PROJECTION},
    photoCaption
  }
}`);

/**
 * Everything /projects renders from the slice: site-fact placeholders
 * filled, the page tokens (`{{count}}`, `{{partner}}`) left for
 * `projectsView`.
 */
export type ProjectsContent = { copy: ProjectsCopy; taskForces: TaskForce[] };

const isTaskForce = (value: unknown): value is TaskForce => {
  const taskForce = (value ?? {}) as Partial<TaskForce>;
  return Boolean(
    taskForce.slug &&
      taskForce.name &&
      taskForce.field &&
      taskForce.description &&
      taskForce.detailedDescription,
  );
};

/** The /projects copy and task forces: the CMS over the code copy. */
export async function getProjectsContent(): Promise<ProjectsContent> {
  const tokens = await getContentTokens();
  return loadContent<ProjectsContent, PROJECTS_CONTENT_QUERY_RESULT>({
    fallback: {
      copy: fillCodeCopy(projectsCopyTemplate, tokens, projectsPageTokens),
      taskForces: fillCodeCopy(taskForces, tokens),
    },
    query: PROJECTS_CONTENT_QUERY,
    tags: ["content:projectsCopy", "content:taskForce"],
    label: "the /projects content",
    mockDocuments: buildProjectsBackfill,
    select: ({ copy, taskForces: forces }) => {
      const filled = fillCmsCopy(forces, tokens, "the task forces");
      return {
        copy: fillCmsCopy(
          copy,
          tokens,
          "the /projects copy",
          projectsPageTokens,
        ),
        taskForces: (Array.isArray(filled) ? filled : [])
          .filter(isTaskForce)
          // Named work needs its partner and at least one item.
          .map(({ work, ...taskForce }) =>
            work?.partner && work.items?.length
              ? { ...taskForce, work }
              : taskForce,
          ),
      };
    },
  });
}

/** The /projects copy and task forces as documents for `pnpm sanity:backfill`. */
export function buildProjectsBackfill(): BackfillDocument[] {
  return [
    { _id: "projectsCopy", _type: "projectsCopy", ...projectsCopyTemplate },
    ...taskForces.map(({ slug, photo, work, ...taskForce }, index) => ({
      _id: backfillId("task-force", slug),
      _type: "taskForce",
      order: (index + 1) * 10,
      slug: { _type: "slug", current: slug },
      ...taskForce,
      ...(work
        ? { work: { partner: work.partner, items: [...work.items] } }
        : {}),
      ...(photo ? { photo: backfillContentImage(photo) } : {}),
    })),
  ];
}
