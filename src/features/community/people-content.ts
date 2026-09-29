import "server-only";

import type { BackfillDocument } from "@/lib/cms-backfill";
import { toContentImage } from "@/lib/cms-content-model";
import {
  buildPersonBackfill,
  getPeople,
  personKey,
} from "@/lib/person-content";
import { type MemberStory, stories } from "./data/member-stories";

/**
 * The member stories slice: `person` documents with the placement
 * `member-story`. Code fallback: `data/member-stories.ts`. /community renders
 * them, and the member journey, /apply and the homepage quote them by name.
 * Other features read it through `./server.ts` (server only).
 */

/** The member stories, in order: the CMS people, or the code list. */
export function getMemberStories(): Promise<MemberStory[]> {
  return getPeople<MemberStory>({
    placement: "member-story",
    fallback: stories,
    label: "the member stories",
    mockDocuments: buildMemberStoriesBackfill,
    select: ({ name, role, story, portrait }) => {
      const image = toContentImage(portrait);
      return story && image ? { name, role, story, image: image.src } : null;
    },
  });
}

/** The member stories as documents for `pnpm sanity:backfill`. */
export function buildMemberStoriesBackfill(): BackfillDocument[] {
  return buildPersonBackfill(
    "member-story",
    stories.map(({ name, role, story, image }) => ({
      key: personKey(name),
      name,
      role,
      story,
      portrait: { src: image },
    })),
  );
}
