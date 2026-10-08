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
  contentString,
  parseContent,
  requireEnum,
  requireObject,
} from "@/lib/cms-content-model";
import { getDepartments, parseMemberEvidence } from "@/lib/community-content";
import { fillCmsCopy } from "@/lib/content-copy";
import type { HOME_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { getSafeSitePath } from "@/lib/security";
import { type HomeCopy, homePageTokens, ledgerKeys } from "./data/homepage";

const HOME_COPY_QUERY = defineQuery(`*[_id == "homeCopy"][0]{
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
    "photos": photos[]{ "key": _key, "image": image${CONTENT_IMAGE_PROJECTION}, caption }
  },
  join{
    title,
    lead,
    stepsTitle,
    steps[]{ title, dates },
    quotes[]{ "key": person->key, "name": person->name, "story": person->story, "placement": person->placement, excerpt }
  },
  partners{ title, lead, moreLabel, "quote": quote->key, "quotePlacement": quote->placement }
}`);

/** Published home copy and its derived department figure. */
export type HomeContent = { copy: HomeCopy; departmentCount: number };
const homeCopyParser = contentObject({
  hero: contentObject({
    title: contentString,
    lead: contentString,
    partnersLabel: contentString,
    photos: contentArray(contentImage),
  }),
  mission: contentObject({ statement: contentString, body: contentString }),
  ledger: contentArray(
    contentObject({
      key: (value, label, path) => requireEnum(value, ledgerKeys, label, path),
      label: contentString,
      note: contentString,
    }),
  ),
  programs: contentObject({
    title: contentString,
    lead: contentString,
    items: contentArray(
      contentObject({
        id: contentString,
        title: contentString,
        description: contentString,
        href: (value, label, path) => {
          const href = contentString(value, label, path);
          return (
            getSafeSitePath(href) ??
            contentError(label, path, "requires a safe site path")
          );
        },
        image: contentImage,
      }),
    ),
  }),
  room: contentObject({
    title: contentString,
    lead: contentString,
    photos: contentArray((value, label, path) => {
      const photo = contentObject({
        key: contentString,
        image: contentImage,
        caption: contentString,
      })(value, label, path);
      return { ...photo.image, key: photo.key, caption: photo.caption };
    }),
  }),
  join: contentObject({
    title: contentString,
    lead: contentString,
    stepsTitle: contentString,
    steps: contentArray(
      contentObject({ title: contentString, dates: contentString }),
    ),
    quotes: contentArray((value, label, path) => {
      const quote = requireObject(value, label, path);
      const evidence = parseMemberEvidence(quote, label, path);
      if (!evidence)
        return contentError(label, path, "requires a member quote");
      return evidence;
    }),
  }),
  partners: (value, label, path) => {
    const source = requireObject(value, label, path);
    if (source.quotePlacement !== "e-lab-testimonial")
      return contentError(
        label,
        `${path}.quote`,
        "requires a resolved E-Lab testimonial",
      );
    return contentObject({
      title: contentString,
      lead: contentString,
      moreLabel: contentString,
      quote: contentString,
    })(source, label, path);
  },
});

/** The quote is a plain complete group; CMS text cannot acquire a local author. */
function selectHomeCopy(value: unknown): HomeCopy {
  const copy = parseContent(value, homeCopyParser, "the homepage copy");
  if (copy.hero.photos.length < 1 || copy.hero.photos.length > 5)
    contentError("the homepage copy", "hero.photos", "requires 1 to 5 photos");
  if (copy.ledger.length < 3 || copy.ledger.length > 8)
    contentError("the homepage copy", "ledger", "requires 3 to 8 figures");
  if (copy.programs.items.length < 1 || copy.programs.items.length > 7)
    contentError(
      "the homepage copy",
      "programs.items",
      "requires 1 to 7 programs",
    );
  if (copy.room.photos.length !== 5)
    contentError(
      "the homepage copy",
      "room.photos",
      "requires exactly 5 photos for the spread",
    );
  if (copy.join.steps.length < 1 || copy.join.steps.length > 4)
    contentError(
      "the homepage copy",
      "join.steps",
      "requires 1 to 4 recruiting steps",
    );
  if (copy.join.quotes.length < 1 || copy.join.quotes.length > 8)
    contentError(
      "the homepage copy",
      "join.quotes",
      "requires 1 to 8 member quotes",
    );
  for (const [path, keys] of [
    ["ledger", copy.ledger.map(({ key }) => key)],
    ["programs.items", copy.programs.items.map(({ id }) => id)],
    ["room.photos", copy.room.photos.map(({ key }) => key)],
    ["join.steps", copy.join.steps.map(({ title }) => title)],
    ["join.quotes", copy.join.quotes.map(({ key }) => key)],
  ] as const) {
    if (new Set(keys).size !== keys.length)
      contentError(
        "the homepage copy",
        path,
        "item identifiers must be unique",
      );
  }
  return copy;
}

/** Published homepage copy; the department collection may deliberately be empty. */
export async function getHomeContent(): Promise<HomeContent> {
  const tokens = await getContentTokens();
  const [copy, teams] = await Promise.all([
    loadContent<HomeCopy, HOME_COPY_QUERY_RESULT>({
      query: HOME_COPY_QUERY,
      tags: ["content:homeCopy", "content:person"],
      label: "the homepage copy",
      select: (result) =>
        selectHomeCopy(
          fillCmsCopy(result, tokens, "the homepage copy", homePageTokens),
        ),
    }),
    getDepartments(tokens),
  ]);
  return { copy, departmentCount: teams.length };
}
