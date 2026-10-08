import "server-only";

import {
  contentImage,
  contentString,
  toContentImage,
} from "@/lib/cms-content-model";
import { getPeople } from "@/lib/person-content";
import type { MemberStory } from "./data/member-stories";

/** Published member stories in editorial order; an empty placement stays empty. */
export function getMemberStories(): Promise<MemberStory[]> {
  return getPeople<MemberStory>({
    placement: "member-story",
    label: "the member stories",
    select: ({ key, name, role, story, portrait }) => {
      const image = contentImage(
        toContentImage(portrait),
        "the member stories",
        "portrait",
      );
      return {
        key: contentString(key, "the member stories.key"),
        name: contentString(name, "the member stories.name"),
        role: contentString(role, "the member stories.role"),
        story: contentString(story, "the member stories.story"),
        image: image.src,
        ...(image.objectPosition
          ? { imagePosition: image.objectPosition }
          : {}),
      };
    },
  });
}
