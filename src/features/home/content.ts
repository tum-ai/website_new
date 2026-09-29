import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { departments } from "@/features/community";
import { buildMemberStoriesBackfill } from "@/features/community/server";
import { buildVentureBackfill } from "@/features/e-lab/server";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { CONTENT_IMAGE_PROJECTION } from "@/lib/cms-content-model";
import { getDepartments } from "@/lib/community-content";
import { backfillContentImage, keyedItems } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import { personId, personKey } from "@/lib/person-content";
import type { HOME_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  type HomeCopy,
  homeCopyTemplate,
  homePageTokens,
  ledgerKeys,
  type RoomPhoto,
} from "./data/homepage";

/**
 * The homepage content slice: the `homeCopy` singleton (hero, mission,
 * ledger labels, programs, room photos, join band, partner band). The
 * ledger figures are the site facts (`home-view.ts`); the department count
 * comes from the shared department list (`lib/community-content.ts`); the
 * quotes reference `person` documents. The code fallback is
 * `data/homepage.ts`.
 */

export const HOME_COPY_QUERY = defineQuery(`*[_id == "homeCopy"][0]{
  hero{
    title,
    lead,
    partnersLabel,
    "photos": photos[]${CONTENT_IMAGE_PROJECTION}
  },
  mission{ statement, body },
  ledger[]{ key, label, note },
  programs{
    title,
    lead,
    items[]{
      "id": key,
      title,
      description,
      href,
      "image": image${CONTENT_IMAGE_PROJECTION}
    }
  },
  room{
    title,
    lead,
    "photos": photos[]{ "image": image${CONTENT_IMAGE_PROJECTION}, caption }
  },
  join{
    title,
    lead,
    stepsTitle,
    steps[]{ title, dates },
    quote{ "name": person->name, excerpt }
  },
  partners{ title, lead, moreLabel, "quote": quote->key }
}`);

/** Everything the homepage renders from the slice. */
export type HomeContent = {
  /** Site-fact placeholders filled; page tokens left for `homeView`. */
  copy: HomeCopy;
  /** How many departments /community lists. */
  departmentCount: number;
};

type Filled = Partial<Record<keyof HomeCopy, Record<string, unknown>>> & {
  ledger?: { key?: string; label?: string; note?: string }[];
};

/** A filled CMS copy, with incomplete list items dropped. */
function selectCopy(copy: Filled | null) {
  if (!copy) return null;
  const photos = (copy.room?.photos ?? []) as {
    image?: RoomPhoto;
    caption?: string;
  }[];
  return {
    ...copy,
    ledger: (copy.ledger ?? []).filter(
      (row) =>
        (ledgerKeys as readonly unknown[]).includes(row.key) &&
        row.label &&
        row.note,
    ),
    programs: copy.programs && {
      ...copy.programs,
      items: (
        (copy.programs.items ?? []) as Partial<
          HomeCopy["programs"]["items"][number]
        >[]
      ).filter(
        (item) =>
          item.id && item.title && item.description && item.href && item.image,
      ),
    },
    room: copy.room && {
      ...copy.room,
      photos: photos.flatMap(({ image, caption }) =>
        image && caption ? [{ ...image, caption }] : [],
      ),
    },
    join: copy.join && {
      ...copy.join,
      steps: (
        (copy.join.steps ?? []) as { title?: string; dates?: string }[]
      ).filter((step) => step.title && step.dates),
    },
  };
}

/** The homepage copy and the department count: the CMS over the code copy. */
export async function getHomeContent(): Promise<HomeContent> {
  const tokens = await getContentTokens();
  const [copy, teams] = await Promise.all([
    loadContent<HomeCopy, HOME_COPY_QUERY_RESULT>({
      fallback: fillCodeCopy(homeCopyTemplate, tokens, homePageTokens),
      query: HOME_COPY_QUERY,
      tags: ["content:homeCopy", "content:person"],
      label: "the homepage copy",
      // The quotes reference people from the member stories and E-Lab slices.
      mockDocuments: () => [
        ...buildHomeBackfill(),
        ...buildMemberStoriesBackfill(),
        ...buildVentureBackfill(),
      ],
      select: (result) =>
        selectCopy(
          fillCmsCopy(
            result,
            tokens,
            "the homepage copy",
            homePageTokens,
          ) as Filled | null,
        ),
    }),
    getDepartments(departments, tokens),
  ]);
  return { copy, departmentCount: teams.length };
}

/** A strong reference to a person document of the backfill. */
const personReference = (...id: Parameters<typeof personId>) => ({
  _type: "reference",
  _ref: personId(...id),
});

/**
 * The homepage copy as a document for `pnpm sanity:backfill`. Its quotes
 * reference the people the member stories and E-Lab slices backfill.
 */
export function buildHomeBackfill(): BackfillDocument[] {
  const { hero, ledger, programs, room, join, partners, ...copy } =
    homeCopyTemplate;
  return [
    {
      _id: "homeCopy",
      _type: "homeCopy",
      ...copy,
      hero: {
        ...hero,
        photos: keyedItems(
          "image",
          hero.photos.map((photo) => backfillContentImage(photo)),
        ),
      },
      ledger: keyedItems("ledgerRow", ledger, ({ key }) => key),
      programs: {
        ...programs,
        items: keyedItems(
          "program",
          programs.items.map(({ id, image, ...program }) => ({
            key: id,
            ...program,
            image: backfillContentImage(image),
          })),
          ({ key }) => key,
        ),
      },
      room: {
        ...room,
        photos: keyedItems(
          "roomPhoto",
          room.photos.map(({ caption, ...image }) => ({
            image: backfillContentImage(image),
            caption,
          })),
        ),
      },
      join: {
        ...join,
        steps: keyedItems("recruitingStep", join.steps),
        quote: {
          person: personReference("member-story", personKey(join.quote.name)),
          excerpt: join.quote.excerpt,
        },
      },
      partners: {
        ...partners,
        quote: personReference("e-lab-testimonial", partners.quote),
      },
    },
  ];
}
