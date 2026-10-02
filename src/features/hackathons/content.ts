import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { CONTENT_IMAGE_PROJECTION } from "@/lib/cms-content-model";
import { backfillContentImage, keyedItems } from "@/lib/content-backfill";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import type { HACKATHONS_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  type HackathonsCopy,
  hackathonsCopyTemplate,
  hackathonsPageTokens,
} from "./data/copy";
import type { MakeathonEdition } from "./data/makeathon";

/**
 * The /hackathons content slice: the `hackathonsCopy` singleton, which
 * holds the page's copy and the Makeathon editions. The ribbon's geometry
 * stays in code (`ribbon.ts`), the league's season in `config/hackathons.ts`
 * and the other hackathons are CMS events; the code fallback is in `data/`.
 */

export const HACKATHONS_COPY_QUERY = defineQuery(`*[_id == "hackathonsCopy"][0]{
  hero{
    eyebrow,
    title,
    lead,
    leagueAction,
    makeathonAction,
    ribbonLabel,
    sliderLabel,
    nextLabel,
    legend{ makeathon, league, partner }
  },
  league{
    eyebrow,
    tagline,
    lead,
    linkLabel,
    routeLabel,
    makeathonDetail,
    finale{
      label,
      text,
      liveLabel,
      pastText,
      actionLabel,
      standingsLabel,
      "poster": poster${CONTENT_IMAGE_PROJECTION},
      championLabel,
      champion,
      runnersUpLabel,
      runnersUp,
      "recapPhoto": recapPhoto${CONTENT_IMAGE_PROJECTION},
      recapCaption
    },
    partnersTitle
  },
  makeathon{
    eyebrow,
    title,
    lead,
    linkLabel,
    "photo": photo${CONTENT_IMAGE_PROJECTION},
    photoCaption,
    figures{
      latest{ value, label },
      editions{ value, label },
      league{ value, label }
    },
    editionsTitle,
    "editionsPhoto": editionsPhoto${CONTENT_IMAGE_PROJECTION},
    editionsPhotoCaption,
    editions[]{ key, name, start, end, city, note, link{ label, href } }
  },
  partners{ title, lead, hostsPrefix, moreLabel },
  offer{ title, lead, items, addOns },
  closing{
    title,
    lead,
    student{ audience, text, actionLabel },
    partner{ audience, text }
  }
}`);

const isDay = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** An edition the ribbon can draw: every field set, the dates in order. */
const isEdition = (value: unknown): value is MakeathonEdition => {
  const edition = (value ?? {}) as Partial<MakeathonEdition>;
  return Boolean(
    edition.key &&
      edition.name &&
      edition.city &&
      edition.note &&
      isDay(edition.start) &&
      isDay(edition.end) &&
      edition.end >= edition.start,
  );
};

/**
 * The /hackathons copy: the CMS over the code copy, site-fact placeholders
 * filled and the page tokens (`{{count}}`, `{{since}}`) left for the page.
 */
export async function getHackathonsCopy(): Promise<HackathonsCopy> {
  const tokens = await getContentTokens();
  return loadContent<HackathonsCopy, HACKATHONS_COPY_QUERY_RESULT>({
    fallback: fillCodeCopy(
      hackathonsCopyTemplate,
      tokens,
      hackathonsPageTokens,
    ),
    query: HACKATHONS_COPY_QUERY,
    tags: ["content:hackathonsCopy"],
    label: "the /hackathons copy",
    mockDocuments: buildHackathonsBackfill,
    select: (result) => {
      const copy = fillCmsCopy(
        result,
        tokens,
        "the /hackathons copy",
        hackathonsPageTokens,
      ) as Partial<HackathonsCopy> | undefined;
      // Structural: the ribbon draws the editions as a whole, so an edition
      // dropped (an unknown placeholder) or unusable keeps the code list.
      const editions = copy?.makeathon?.editions;
      const complete =
        Array.isArray(editions) &&
        editions.length === (result?.makeathon?.editions?.length ?? -1) &&
        editions.every(isEdition);
      return {
        ...copy,
        makeathon: {
          ...copy?.makeathon,
          editions: complete ? editions : undefined,
        },
      };
    },
  });
}

/** The /hackathons copy as a document for `pnpm sanity:backfill`. */
export function buildHackathonsBackfill(): BackfillDocument[] {
  const { makeathon, league, ...copy } = hackathonsCopyTemplate;
  return [
    {
      _id: "hackathonsCopy",
      _type: "hackathonsCopy",
      ...copy,
      league: {
        ...league,
        finale: {
          ...league.finale,
          poster: backfillContentImage(league.finale.poster),
        },
      },
      makeathon: {
        ...makeathon,
        photo: backfillContentImage(makeathon.photo),
        editionsPhoto: backfillContentImage(makeathon.editionsPhoto),
        editions: keyedItems(
          "makeathonEdition",
          makeathon.editions,
          ({ key }) => key,
        ),
      },
    },
  ];
}
