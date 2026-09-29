/**
 * How a research document's title names its institutions: "Institution,
 * Institution: Topic", the old site's convention. The page shows the topic
 * and, for a document without `institutions` references, cites the names
 * before the colon; `pnpm sanity:migrate-org-references` turns those names
 * into references. Free of imports, so the migration's Sanity CLI step can
 * load it by a relative path.
 */

/* Segments of a title's lead that name a person, not an institution
   ("University of Cambridge, Prof. Olaf Wysocki: …"). */
const personPattern = /^(prof|dr)\b\.?/i;

/* Short forms the titles use for an institution named in full elsewhere. */
const titleAliases: Readonly<Record<string, string>> = {
  CAMP: "TUM CAMP",
};

/** Whether two names are the same, ignoring case and accents. */
export function sameName(a: string, b: string) {
  return a.localeCompare(b, "en", { sensitivity: "base" }) === 0;
}

/** Whether `specific` names a part of `general` ("IBM Almaden" of "IBM"). */
function isPartOf(specific: string, general: string) {
  return specific.toLowerCase().startsWith(`${general.toLowerCase()} `);
}

/** Collapses the whitespace and line breaks titles sometimes contain. */
function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Splits a title "Institution, Institution: Topic" into the institutions
 * and the topic. Without a colon the whole title is the topic.
 */
export function splitResearchTitle(rawTitle: string): {
  institutions: string[];
  title: string;
} {
  const title = normalizeSpace(rawTitle);
  const colon = title.indexOf(":");
  if (colon < 0) return { institutions: [], title };

  const names = title
    .slice(0, colon)
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment && !personPattern.test(segment))
    .map((segment) => titleAliases[segment] ?? segment);
  const unique = names.filter(
    (name, index) =>
      names.findIndex((other) => sameName(other, name)) === index,
  );
  // "TUM" beside "TUM CAMP" says nothing the narrower name doesn't.
  const institutions = unique.filter(
    (name) => !unique.some((other) => isPartOf(other, name)),
  );
  return {
    institutions,
    title: title.slice(colon + 1).trim() || title,
  };
}
