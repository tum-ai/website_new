import type { ValidationContext } from "sanity";
import { spanProblems } from "../../../lib/passage-spans";
import { sanityApiVersion } from "../../../lib/sanity-config";

/**
 * Studio validation for the /qanda mission marks: each Q&A entry's
 * `spans` quote words of `qandaCopy.missionPassage`, which the page marks
 * when the question is open. A quote must occur in the passage exactly once
 * and must not overlap another entry's quote (`lib/passage-spans.ts`, the
 * rule the page and the tests apply too). Both sides are checked against
 * the published documents: publish the passage first, then fix the quotes.
 */

const published = '!(_id in path("drafts.**"))';

const publishedId = (id: string | undefined) =>
  (id ?? "").replace(/^drafts\./, "");

type SpanDocument = {
  id: string;
  question: string | null;
  spans: string[] | null;
};

/** The problems of one entry's `spans` against the published passage. */
export async function validateEntrySpans(
  spans: unknown,
  context: ValidationContext,
): Promise<true | string> {
  const document = context.document as
    | { _id?: string; collection?: string }
    | undefined;
  if (document?.collection !== "qanda" || !Array.isArray(spans)) return true;
  const id = publishedId(document._id);
  const { passage, others } = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<{ passage: string | null; others: SpanDocument[] }>(
      `{
        "passage": *[_id == "qandaCopy"][0].missionPassage,
        "others": *[_type == "faq" && collection == "qanda" && ${published} && _id != $id]{ "id": _id, question, spans }
      }`,
      { id },
    );
  if (!passage && spans.length > 0)
    return "Publish the Q&A mission passage before adding mission phrases.";
  if (!passage) return true;
  const problems = spanProblems(passage, [
    ...spans.map((text) => ({ id, text: String(text) })),
    ...others.flatMap((other) =>
      (other.spans ?? []).map((text) => ({ id: other.id, text })),
    ),
  ]).filter(({ span, with: other }) => span.id === id || other?.id === id);
  return problems.length === 0
    ? true
    : `${problems.map(({ problem }) => problem).join(" ")} Quote the Q&A page's mission passage word for word.`;
}

/** The published entries whose `spans` a new passage would break. */
export async function validatePassageSpans(
  passage: unknown,
  context: ValidationContext,
): Promise<true | string> {
  if (typeof passage !== "string" || !passage) return true;
  const entries = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<SpanDocument[]>(
      `*[_type == "faq" && collection == "qanda" && ${published}]{ "id": _id, question, spans }`,
    );
  const problems = spanProblems(
    passage,
    entries.flatMap((entry) =>
      (entry.spans ?? []).map((text) => ({ id: entry.id, text })),
    ),
  );
  if (problems.length === 0) return true;
  const questions = new Set(
    problems.map(
      ({ span }) =>
        entries.find((entry) => entry.id === span.id)?.question ?? span.id,
    ),
  );
  return `These answers' mission phrases no longer match the passage, and prevent the page from rendering: ${[...questions].join("; ")}. Update their phrases after publishing.`;
}
