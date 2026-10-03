/**
 * The plan of `pnpm sanity:migrate-home-quotes`: the homepage's single
 * member quote (`homeCopy.join.quote`) becomes the first entry of the list
 * of member quotes (`homeCopy.join.quotes`), as the editor set it, followed
 * by the code copy's other quotes (`features/home/data/homepage.ts`) whose
 * member story is in the dataset. A document that already has the list is
 * left alone. Imports are relative: `sanity exec` runs the apply step
 * without the `@/` alias.
 */
import { stories } from "../../src/features/community/data/member-stories";
import { homeCopyTemplate } from "../../src/features/home/data/homepage";

/** The published homepage copy and its draft, with the people it may quote. */
export const PLAN_QUERY = `{
  "documents": *[_id in ["homeCopy", "drafts.homeCopy"]]{ _id, _rev, join },
  "people": *[_type == "person" && placement == "member-story" && !(_id in path("drafts.**"))]{ _id, key }
}`;

type Reference = { _type: "reference"; _ref: string };
type StoredQuote = { person?: Reference; excerpt?: string };

/** What {@link PLAN_QUERY} returns. */
export type PlanInput = {
  documents: {
    _id: string;
    _rev?: string;
    join?: { quote?: StoredQuote; quotes?: unknown[] };
  }[];
  people: { _id: string; key?: string }[];
};

/** One document's patch, to apply at the revision it was planned from. */
export type QuotesPatch = {
  id: string;
  rev?: string;
  set: Record<string, unknown>;
  unset: string[];
};

/** The patches and a line per document for the log. */
export function planHomeQuotes({ documents, people }: PlanInput) {
  const personOf = new Map(people.map(({ _id, key }) => [key, _id]));
  const patches: QuotesPatch[] = [];
  const lines: string[] = [];
  for (const { _id, _rev, join } of documents) {
    if (join?.quotes) {
      lines.push(`${_id}: has join.quotes, left alone`);
      continue;
    }
    const first = join?.quote?.person?._ref ? [join.quote] : [];
    const taken = new Set(first.map((quote) => quote.person?._ref));
    const rest = homeCopyTemplate.join.quotes.flatMap(({ name, excerpt }) => {
      const key = stories.find((story) => story.name === name)?.key;
      const ref = key && personOf.get(key);
      if (!ref || taken.has(ref)) return [];
      taken.add(ref);
      return [{ person: { _type: "reference", _ref: ref }, excerpt }];
    });
    const quotes = [...first, ...rest].map((quote) => ({
      _key: quote.person?._ref,
      _type: "memberQuote",
      ...quote,
    }));
    patches.push({
      id: _id,
      rev: _rev,
      set: { "join.quotes": quotes },
      unset: ["join.quote"],
    });
    lines.push(
      `${_id}: join.quote → join.quotes (${quotes.length}): ${quotes
        .map((quote) => quote.person?._ref)
        .join(", ")}`,
    );
  }
  return { patches, lines };
}
