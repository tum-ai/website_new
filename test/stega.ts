import { createRequire } from "node:module";

type StegaEncoder = {
  stegaEncodeSourceMap: <Result>(
    result: Result,
    resultSourceMap: unknown,
    config: { enabled: true; studioUrl: string },
  ) => Result;
};

/*
 * next-sanity re-exports only `stegaClean`; the encoder is in the
 * `@sanity/client` it depends on, which pnpm doesn't hoist to the project.
 * Resolving it from next-sanity loads the exact client draft mode runs.
 */
const requireFromNextSanity = createRequire(
  createRequire(import.meta.url).resolve("next-sanity"),
);
const { stegaEncodeSourceMap } = requireFromNextSanity(
  "@sanity/client/stega",
) as StegaEncoder;

/**
 * `value` as a draft-mode fetch with stega returns it: the string followed by
 * invisible characters that encode its source (document `documentId`, field
 * `field`) for click-to-edit. Equal values from different documents or fields
 * encode differently, as they do in draft mode.
 *
 * ```ts
 * const category = stegaEncode("Hackathon", "event-1", "category");
 * category === "Hackathon"; // false
 * ```
 */
export function stegaEncode(
  value: string,
  documentId = "event-1",
  field = "title",
): string {
  const path = `$['value']`;
  const encoded = stegaEncodeSourceMap(
    { value },
    {
      documents: [{ _id: documentId, _type: "event" }],
      paths: [`$['${field}']`],
      mappings: {
        [path]: {
          type: "value",
          source: { type: "documentValue", document: 0, path: 0 },
        },
      },
    },
    { enabled: true, studioUrl: "/studio" },
  );
  if (encoded.value === value) {
    throw new Error(`stega left "${value}" unencoded`);
  }
  return encoded.value;
}
