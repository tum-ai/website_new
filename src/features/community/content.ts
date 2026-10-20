import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  contentImage,
  contentObject,
  contentString,
  parseContent,
} from "@/lib/cms-content-model";
import { getDepartments, getMemberJourney } from "@/lib/community-content";
import type { Department, JourneyStage } from "@/lib/community-model";
import { fillCmsCopy } from "@/lib/content-copy";
import type { ContentTokens } from "@/lib/content-tokens";
import type { COMMUNITY_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import type { CommunityCopy } from "./data/copy";

export const COMMUNITY_COPY_QUERY = defineQuery(`*[_id == "communityCopy"][0]{
  hero{ title, lead, "photo": photo${CONTENT_IMAGE_PROJECTION}, photoCaption },
  journey{ title, lead }, departments{ title, lead }, stories{ title, lead },
  closing{ title, lead, companiesReader }
}`);

/** Complete published copy and the shared community collections. */
export type CommunityContent = {
  copy: CommunityCopy;
  journey: JourneyStage[];
  departments: Department[];
};
const heading = contentObject({ title: contentString, lead: contentString });
const communityCopyParser = contentObject({
  hero: contentObject({
    title: contentString,
    lead: contentString,
    photo: contentImage,
    photoCaption: contentString,
  }),
  journey: heading,
  departments: heading,
  stories: heading,
  closing: contentObject({
    title: contentString,
    lead: contentString,
    companiesReader: contentString,
  }),
});
/** Shared validated journey for Q&A and other server features. */
export function getJourneyStages(
  tokens: ContentTokens,
): Promise<JourneyStage[]> {
  return getMemberJourney(tokens);
}
/** The community page has one published source for each content field. */
export async function getCommunityContent(): Promise<CommunityContent> {
  const tokens = await getContentTokens();
  const [copy, journey, departments] = await Promise.all([
    loadContent<CommunityCopy, COMMUNITY_COPY_QUERY_RESULT>({
      query: COMMUNITY_COPY_QUERY,
      tags: ["content:communityCopy"],
      label: "the /community copy",
      select: (result) =>
        parseContent(
          fillCmsCopy(result, tokens, "the /community copy"),
          communityCopyParser,
          "the /community copy",
        ),
    }),
    getJourneyStages(tokens),
    getDepartments(tokens),
  ]);
  return { copy, journey, departments };
}
