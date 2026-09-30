import type { ValidationContext } from "sanity";
import { isExcerptOf } from "../../../lib/quote-excerpt";
import { sanityApiVersion } from "../../../lib/sanity-config";
import { copyText } from "./copy-fields";

/**
 * A quote taken from a member's story (`person.story`): the homepage's
 * member quote (`homeCopy.join.quote`) and a journey step's evidence
 * (`journeyStep.evidence`). Both hold a `person` reference and the
 * `excerpt`; the story is the source, so the excerpt must stay a passage
 * of it (`lib/quote-excerpt.ts`, the rule the tests apply to the code
 * copy). Checked against the published story: publish a story edit first,
 * then fix the quotes.
 */

const published = '!(_id in path("drafts.**"))';

/**
 * Why `excerpt` can't be quoted from `story`, or `true`. Without a story
 * (none picked yet, or not published) there is nothing to check against.
 * Exported for tests.
 */
export function excerptProblem(
  excerpt: unknown,
  story: unknown,
): true | string {
  if (typeof excerpt !== "string" || !excerpt.trim()) return true;
  if (typeof story !== "string" || !story.trim()) return true;
  return isExcerptOf(excerpt, story)
    ? true
    : "Quote the member's story word for word: this sentence is not in it.";
}

/**
 * The excerpt against the published story of the person picked beside it
 * (`context.parent.person`). Exported for tests.
 */
export async function validateStoryExcerpt(
  excerpt: string | undefined,
  context: ValidationContext,
): Promise<true | string> {
  const parent = context.parent as { person?: { _ref?: string } } | undefined;
  const id = parent?.person?._ref;
  if (!excerpt || !id) return true;
  const story = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<string | null>(`*[_id == $id && ${published}][0].story`, { id });
  return excerptProblem(excerpt, story);
}

/** The quote beside a member-story `person` reference. */
export function storyExcerptField() {
  return copyText({
    name: "excerpt",
    title: "Quote",
    description:
      "A sentence of the member's story, word for word (the page adds the quote marks).",
    max: 200,
    rows: 2,
    validate: validateStoryExcerpt,
  });
}

type QuotingDocument = {
  _id: string;
  number: string | null;
  excerpt: string | null;
};

/**
 * A warning on a member's story when a published quote of it (the homepage
 * quote, a journey step's evidence) is no longer in it. A warning, not an
 * error: the quotes can only be fixed after the story is published.
 */
export async function validateQuotedStory(
  story: unknown,
  context: ValidationContext,
): Promise<true | string> {
  const id = (context.document?._id ?? "").replace(/^drafts\./, "");
  if (typeof story !== "string" || !story.trim() || !id) return true;
  const quoting = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<QuotingDocument[]>(
      `*[${published} && (
        (_type == "journeyStep" && evidence.person._ref == $id) ||
        (_id == "homeCopy" && join.quote.person._ref == $id)
      )]{ _id, number, "excerpt": coalesce(evidence.excerpt, join.quote.excerpt) }`,
      { id },
    );
  const broken = quoting.filter(
    ({ excerpt }) => excerptProblem(excerpt, story) !== true,
  );
  if (broken.length === 0) return true;
  const places = broken.map(({ _id, number }) =>
    _id === "homeCopy" ? "the homepage quote" : `journey step ${number}`,
  );
  return `No longer contains the sentence quoted by ${places.join(" and ")}. After publishing, update that quote.`;
}
