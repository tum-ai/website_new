import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { CONTENT_IMAGE_PROJECTION } from "@/lib/cms-content-model";
import {
  buildDepartmentBackfill,
  buildJourneyBackfill,
  getDepartments,
  getMemberJourney,
} from "@/lib/community-content";
import type { Department, JourneyStage } from "@/lib/community-model";
import { backfillContentImage } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import type { COMMUNITY_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { type CommunityCopy, communityCopyTemplate } from "./data/copy";
import { departments as departmentTemplates } from "./data/departments";
import { memberJourney } from "./data/member-journey";

/**
 * The /community content slice: the `communityCopy` singleton, the member
 * journey (`journeyStep`) and the departments (`department`). The journey
 * and departments are read through `lib/community-content.ts`, which /apply
 * and the homepage share; the code fallbacks are in `data/`.
 */

export const COMMUNITY_COPY_QUERY = defineQuery(`*[_id == "communityCopy"][0]{
  hero{ title, lead, "photo": photo${CONTENT_IMAGE_PROJECTION}, photoCaption },
  journey{ title, lead },
  departments{ title, lead },
  closing{ title, lead, companiesReader }
}`);

/** Everything /community renders from the slice, placeholders filled. */
export type CommunityContent = {
  copy: CommunityCopy;
  journey: JourneyStage[];
  departments: Department[];
};

/** The /community copy, journey and departments: the CMS over the code copy. */
export async function getCommunityContent(): Promise<CommunityContent> {
  const tokens = await getContentTokens();
  const [copy, journey, departments] = await Promise.all([
    loadContent<CommunityCopy, COMMUNITY_COPY_QUERY_RESULT>({
      fallback: fillCodeCopy(communityCopyTemplate, tokens),
      query: COMMUNITY_COPY_QUERY,
      tags: ["content:communityCopy"],
      label: "the /community copy",
      mockDocuments: buildCommunityBackfill,
      select: (result) => fillCmsCopy(result, tokens, "the /community copy"),
    }),
    getMemberJourney(memberJourney, tokens),
    getDepartments(departmentTemplates, tokens),
  ]);
  return { copy, journey, departments };
}

/**
 * The /community copy, the journey steps and the departments as documents
 * for `pnpm sanity:backfill`.
 */
export function buildCommunityBackfill(): BackfillDocument[] {
  const { hero, ...copy } = communityCopyTemplate;
  return [
    {
      _id: "communityCopy",
      _type: "communityCopy",
      hero: { ...hero, photo: backfillContentImage(hero.photo) },
      ...copy,
    },
    ...buildJourneyBackfill(memberJourney),
    ...buildDepartmentBackfill(departmentTemplates),
  ];
}
