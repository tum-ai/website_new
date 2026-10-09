import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { liveCacheTags } from "@/lib/cache-tags";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  type ContentParser,
  contentArray,
  contentError,
  contentImage,
  contentObject,
  contentOptional,
  contentString,
  contentText,
  parseContent,
  requireObject,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import { munichIsoDate } from "@/lib/munich-time";
import type { HACKATHONS_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  type HackathonsCopy,
  hackathonsPageTokens,
  type MakeathonEdition,
} from "./model";

/** Published page copy; league facts and logos have their own CMS owners. */
export const HACKATHONS_COPY_QUERY = defineQuery(`*[_id == "hackathonsCopy"][0]{
  "voiceCaseStudyRef": voiceCaseStudy,
  "voiceCaseStudy": select(voiceCaseStudy->_type == "caseStudy" => voiceCaseStudy->_id),
  "outcomeCaseStudyRef": outcomeCaseStudy,
  "outcomeCaseStudy": select(outcomeCaseStudy->_type == "caseStudy" => outcomeCaseStudy->_id),
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
    figures{
      latest{ value, label },
      editions{ value, label },
      league{ value, label }
    },
    editionsTitle,
    "editionsPhoto": editionsPhoto${CONTENT_IMAGE_PROJECTION},
    editionsPhotoCaption,
    editions[]{ key, name, "start": event->event_date, "end": coalesce(event->end_date, event->event_date), "city": event->city, note, link{ label, href } }
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

/** An edition's event date (`event_date`, `end_date`) as its Munich calendar day. */
const day: ContentParser<string> = (value, label, path) => {
  const text = contentString(value, label, path);
  if (!Number.isFinite(Date.parse(text)))
    return contentError(label, path, "expected the edition's event date");
  return munichIsoDate(new Date(text));
};
const link = contentObject({ label: contentString, href: contentString });
const edition: ContentParser<MakeathonEdition> = (value, label, path) => {
  const item = contentObject({
    key: contentString,
    name: contentString,
    start: day,
    end: day,
    city: contentString,
    note: contentString,
    link: contentOptional(link),
  })(value, label, path);
  if (!/^[a-z0-9-]+$/.test(item.key))
    contentError(label, `${path}.key`, "expected a stable lowercase key");
  if (item.end < item.start)
    contentError(label, path, "edition ends before it starts");
  if (item.link && !item.link.href.startsWith("https://"))
    contentError(label, `${path}.link.href`, "expected an https:// address");
  return item;
};
const editions: ContentParser<MakeathonEdition[]> = (value, label, path) => {
  const items = contentArray(edition)(value, label, path);
  if (items.length === 0)
    contentError(label, path, "at least one edition is required");
  if (new Set(items.map(({ key }) => key)).size !== items.length)
    contentError(label, path, "edition keys must be unique");
  if (
    items.some(
      (item, index) => index > 0 && item.start < items[index - 1].start,
    )
  )
    contentError(label, path, "editions must be oldest first");
  return items;
};
const figure = contentObject({ value: contentString, label: contentString });
const copyParser = contentObject({
  voiceCaseStudy: contentOptional(contentString),
  outcomeCaseStudy: contentOptional(contentString),
  hero: contentObject({
    eyebrow: contentString,
    title: contentString,
    lead: contentString,
    leagueAction: contentString,
    makeathonAction: contentString,
    ribbonLabel: contentString,
    sliderLabel: contentString,
    nextLabel: contentString,
    legend: contentObject({
      makeathon: contentString,
      league: contentString,
      partner: contentString,
    }),
  }),
  league: contentObject({
    eyebrow: contentString,
    tagline: contentString,
    lead: contentString,
    linkLabel: contentString,
    routeLabel: contentString,
    makeathonDetail: contentString,
    partnersTitle: contentString,
    finale: contentObject({
      label: contentString,
      text: contentString,
      liveLabel: contentString,
      pastText: contentString,
      actionLabel: contentString,
      standingsLabel: contentString,
      poster: contentImage,
      championLabel: contentString,
      champion: contentOptional(contentText),
      runnersUpLabel: contentString,
      runnersUp: contentOptional(contentArray(contentText)),
      recapPhoto: contentOptional(contentImage),
      recapCaption: contentOptional(contentText),
    }),
  }),
  makeathon: contentObject({
    eyebrow: contentString,
    title: contentString,
    lead: contentString,
    linkLabel: contentString,
    figures: contentObject({
      latest: figure,
      editions: figure,
      league: figure,
    }),
    editionsTitle: contentString,
    editionsPhoto: contentImage,
    editionsPhotoCaption: contentString,
    editions,
  }),
  partners: contentObject({
    title: contentString,
    lead: contentString,
    hostsPrefix: contentString,
    moreLabel: contentString,
  }),
  offer: contentObject({
    title: contentString,
    lead: contentString,
    items: contentArray(contentString),
    addOns: contentString,
  }),
  closing: contentObject({
    title: contentString,
    lead: contentString,
    student: contentObject({
      audience: contentString,
      text: contentString,
      actionLabel: contentString,
    }),
    partner: contentObject({ audience: contentString, text: contentString }),
  }),
});

/** Validate a complete singleton without restoring deleted or malformed content. */
export function parseHackathonsCopy(value: unknown): HackathonsCopy {
  const label = "the /hackathons copy";
  const record = requireObject(value, label);
  for (const field of ["voiceCaseStudy", "outcomeCaseStudy"] as const) {
    if (record[`${field}Ref`] != null && !record[field])
      contentError(
        label,
        field,
        "selected case-study reference does not resolve",
      );
  }
  return parseContent(record, copyParser, label);
}

/** Published copy with site tokens filled and page-derived tokens preserved. */
export async function getHackathonsCopy(): Promise<HackathonsCopy> {
  const tokens = await getContentTokens();
  return loadContent<HackathonsCopy, HACKATHONS_COPY_QUERY_RESULT>({
    query: HACKATHONS_COPY_QUERY,
    tags: [
      "content:hackathonsCopy",
      "content:caseStudy",
      ...liveCacheTags.event,
    ],
    label: "the /hackathons copy",
    select: (result) =>
      parseHackathonsCopy(
        fillCmsCopy(
          result,
          tokens,
          "the /hackathons copy",
          hackathonsPageTokens,
        ),
      ),
  });
}
