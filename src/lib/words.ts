/**
 * Small helpers for numbers and lists in running English copy, in the site's
 * house style: British list punctuation (no serial comma) and small counts
 * spelled out.
 */

const conjunction = new Intl.ListFormat("en-GB", {
  style: "long",
  type: "conjunction",
});

/** "Anthropic, Lovable and Hugging Face": a list in running text. */
export function formatList(items: readonly string[]): string {
  return conjunction.format(items);
}

const disjunction = new Intl.ListFormat("en-GB", {
  style: "long",
  type: "disjunction",
});

/** "Harvard, MIT or Inria": a list of alternatives in running text. */
export function formatListOr(items: readonly string[]): string {
  return disjunction.format(items);
}

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
] as const;

/**
 * A count for prose: "seven" up to twelve, digits above (style guides spell
 * out small numbers only). Negative or fractional counts stay digits.
 */
export function spellCount(count: number): string {
  return (Number.isInteger(count) && NUMBER_WORDS[count]) || String(count);
}

/** The same with a capital, for the start of a sentence: "Four stages". */
export function spellCountCapitalized(count: number): string {
  const word = spellCount(count);
  return word.charAt(0).toUpperCase() + word.slice(1);
}
