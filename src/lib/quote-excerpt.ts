/**
 * Excerpts quoted from a longer text: the homepage's member quotes and the
 * member journey's evidence each quote a sentence of a member's story, word
 * for word. The story is the source; the excerpt must stay inside it, or the
 * page attributes words to a member that their story no longer says.
 *
 * Isomorphic and free of runtime imports: the Studio validation
 * (`sanity/schemas/content/excerpt-rules.ts`) and the tests use it.
 */

/**
 * `text` with typography that doesn't change the words evened out: curly
 * quotes and apostrophes as straight ones, "…" as three dots, and every run
 * of whitespace (line breaks included) as one space.
 */
export function normaliseQuoteText(text: string): string {
  return text
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Whether `excerpt` is a passage of `text`, compared after
 * {@link normaliseQuoteText}. Quote marks around the excerpt are ignored
 * (the page adds its own), and so is the case of its first letter: a quote
 * cut from mid-sentence ("…: within my first month") may open with a
 * capital. An empty excerpt is none.
 */
export function isExcerptOf(excerpt: string, text: string): boolean {
  const words = normaliseQuoteText(excerpt).replace(/^["']+|["']+$/g, "");
  if (words.trim() === "") return false;
  const source = normaliseQuoteText(text);
  const rest = words.slice(1);
  return [words[0]?.toLowerCase(), words[0]?.toUpperCase()].some((first) =>
    source.includes(`${first}${rest}`),
  );
}
