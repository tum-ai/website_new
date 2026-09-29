/**
 * The backfill's copy of the old site's content: every published `event`,
 * `partner` and `research` document in `production`, read over the public
 * API (no token, read only) and turned into documents for
 * `sanity dataset import`, so the new site's dataset holds everything the new
 * site reads (docs/adr/0009-cms-content-source.md).
 *
 * - `_id`s stay the same, so the public API and links keep their ids.
 * - Drafts and release versions are skipped (only published documents).
 * - Every image asset reference becomes an `_sanityAsset` with the asset's
 *   CDN URL, so the import uploads the file into the target dataset; hotspot,
 *   crop and the image's other fields are kept.
 * - Events get the `hosts` from `liveEventHosts` (lib/mock-cms.ts), matched
 *   by title and start; an entry that matches no event, or several, fails
 *   the run.
 *
 * The fetch is a parameter (`fetchDocuments`), so tests run the transform on
 * a fixture without the network.
 */
import type { BackfillDocument } from "@/lib/cms-backfill";
import { liveEventHosts } from "@/lib/mock-cms";
import { legacyDataset } from "@/lib/sanity-config";

/** The document types the old site has, copied as they are. */
export const copiedTypes = ["event", "partner", "research"] as const;

/** A document as the Sanity API returns it. */
export type SourceDocument = {
  _id: string;
  _type: string;
  [field: string]: unknown;
};

/** Reads the published documents of `copiedTypes` from `dataset`. */
export type FetchDocuments = (source: {
  projectId: string;
  dataset: string;
}) => Promise<SourceDocument[]>;

/** Co-hosts for the event with this title and start. */
export type EventHosts = {
  title: string;
  event_date: string;
  hosts: readonly string[];
};

/** Published documents only: drafts and release versions are skipped. */
const PUBLISHED_QUERY = `*[_type in $types && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_type asc, _id asc)`;

/**
 * Reads the documents over the public HTTP API: no token, so only published
 * documents of a public dataset, and not the API CDN, so a run right before
 * launch sees the latest edits. Throws on any failure: a partial copy must
 * never reach the import.
 */
export const fetchPublishedDocuments: FetchDocuments = async ({
  projectId,
  dataset,
}) => {
  const url = new URL(
    `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`,
  );
  url.searchParams.set("query", PUBLISHED_QUERY);
  url.searchParams.set("$types", JSON.stringify(copiedTypes));
  url.searchParams.set("perspective", "published");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Could not read "${dataset}" of project "${projectId}": HTTP ${response.status} ${await response.text()}`,
    );
  }
  const { result } = (await response.json()) as { result?: unknown };
  if (!Array.isArray(result)) {
    throw new Error(`Unexpected response from "${dataset}": no result list`);
  }
  return result as SourceDocument[];
};

/** Fields the source dataset sets on its own revision; the import sets them anew. */
const serverFields = new Set(["_rev", "_updatedAt", "_system"]);

/**
 * The CDN URL of an image asset (`image-<sha1>-<w>x<h>-<ext>`) in
 * `dataset`. Anything else throws: the import could not upload it.
 */
export function imageAssetUrl(
  ref: string,
  projectId: string,
  dataset: string,
): string {
  const match = /^image-([a-f0-9]+)-(\d+x\d+)-([a-z0-9]+)$/.exec(ref);
  if (!match) throw new Error(`Not an image asset reference: "${ref}"`);
  const [, hash, size, extension] = match;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${hash}-${size}.${extension}`;
}

/**
 * `value` with every image's `asset` reference swapped for an
 * `_sanityAsset` the import uploads; all other fields (hotspot, crop, alt,
 * `_key`) stay.
 */
function withImportableAssets(
  value: unknown,
  source: { projectId: string; dataset: string },
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => withImportableAssets(item, source));
  }
  if (!value || typeof value !== "object") return value;
  const { asset, ...fields } = value as { asset?: unknown };
  const copy = Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [
      key,
      withImportableAssets(field, source),
    ]),
  );
  if (asset === undefined) return copy;
  const ref = (asset as { _ref?: unknown } | null)?._ref;
  if (typeof ref !== "string") {
    throw new Error(`An asset without a reference: ${JSON.stringify(asset)}`);
  }
  return {
    ...copy,
    _sanityAsset: `image@${imageAssetUrl(ref, source.projectId, source.dataset)}`,
  };
}

const normalizedTitle = (title: unknown) =>
  typeof title === "string" ? title.trim().replace(/\s+/g, " ") : "";

const sameInstant = (a: unknown, b: string) =>
  typeof a === "string" && Date.parse(a) === Date.parse(b);

/** What the copy did, for the script's output. */
export type ProductionCopy = {
  documents: BackfillDocument[];
  /** Events that got `hosts` from the code data. */
  hostsAdded: number;
  /** Events whose own `hosts` were kept (an editor filled them). */
  hostsKept: number;
};

/**
 * The import documents for `documents` (the source dataset's response):
 * published documents of `copiedTypes` only, same `_id`s, server fields
 * dropped, assets importable, and `hosts` added to the events from
 * `eventHosts`. Each entry must match exactly one event by title (trimmed)
 * and start instant, or this throws with every entry that did not.
 */
export function copyProductionDocuments(
  documents: readonly SourceDocument[],
  {
    projectId,
    dataset = legacyDataset,
    eventHosts = liveEventHosts,
  }: {
    projectId: string;
    dataset?: string;
    eventHosts?: readonly EventHosts[];
  },
): ProductionCopy {
  const types = new Set<string>(copiedTypes);
  const copies = documents
    .filter(({ _id, _type }) => types.has(_type) && !_id.includes("."))
    .map((document) => {
      const fields = Object.fromEntries(
        Object.entries(document).filter(([key]) => !serverFields.has(key)),
      );
      return withImportableAssets(fields, {
        projectId,
        dataset,
      }) as BackfillDocument;
    });

  const unmatched: string[] = [];
  let hostsAdded = 0;
  let hostsKept = 0;
  for (const entry of eventHosts) {
    const matches = copies.filter(
      (document) =>
        document._type === "event" &&
        normalizedTitle(document.title) === normalizedTitle(entry.title) &&
        sameInstant(document.event_date, entry.event_date),
    );
    const [event] = matches;
    if (matches.length !== 1 || !event) {
      unmatched.push(
        `"${entry.title}" on ${entry.event_date} (${matches.length} events match)`,
      );
      continue;
    }
    if (Array.isArray(event.hosts) && event.hosts.length > 0) {
      hostsKept++;
    } else {
      event.hosts = [...entry.hosts];
      hostsAdded++;
    }
  }
  if (unmatched.length > 0) {
    throw new Error(
      `Co-hosts in lib/mock-cms.ts (liveEventHosts) that match no single event in "${dataset}"; fix the title or date there:\n  ${unmatched.join("\n  ")}`,
    );
  }
  return { documents: copies, hostsAdded, hostsKept };
}

/**
 * The copy of `production` for the backfill: `fetchDocuments` (the public
 * API by default; a fixture in tests), then {@link copyProductionDocuments}.
 */
export async function copyFromProduction({
  projectId,
  fetchDocuments = fetchPublishedDocuments,
}: {
  projectId: string;
  fetchDocuments?: FetchDocuments;
}): Promise<ProductionCopy> {
  const documents = await fetchDocuments({ projectId, dataset: legacyDataset });
  return copyProductionDocuments(documents, { projectId });
}
