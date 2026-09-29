/**
 * Where the site's Sanity content lives: one project, two datasets.
 *
 * - The **live dataset** (`NEXT_PUBLIC_SANITY_DATASET`, `production`) holds
 *   the `event`, `partner` and `research` documents. The old site on `main`
 *   reads the same dataset and renders every document of those types, so
 *   nothing in this repository writes to it.
 * - The **content dataset** (`NEXT_PUBLIC_SANITY_CONTENT_DATASET`, planned
 *   `redesign`) holds the page content that moves out of code (FAQs,
 *   campaigns, logos, copy; see docs/adr/0009-cms-content-source.md). It
 *   has **no default**: unset (or set to the live dataset), there is no
 *   content dataset, so the Studio has no `content` workspace and the pages
 *   render the code content. Nothing ever falls back to the live dataset,
 *   whose documents the old site renders.
 *
 * Only public values: this module is shared by the server fetch layers
 * (`lib/sanity.ts`, `lib/cms-content.ts`) and the Studio config, which runs
 * in the browser.
 */

/** The Sanity project; a placeholder keeps the clients constructible in tests. */
export const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id";

/** The live dataset: events, partners and research projects. */
export const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/**
 * The content dataset for `value` (`NEXT_PUBLIC_SANITY_CONTENT_DATASET`), or
 * `null` when there is none: unset, blank, or naming the live dataset. The
 * page content types never go to the live dataset, so naming it counts as
 * unset rather than as a way to put both in one dataset.
 */
function contentDatasetOf(
  value: string | undefined,
  liveDataset: string = sanityDataset,
): string | null {
  const dataset = value?.trim();
  return dataset && dataset !== liveDataset ? dataset : null;
}

/**
 * The content dataset: the page content types (the `content` workspace), or
 * `null` when `NEXT_PUBLIC_SANITY_CONTENT_DATASET` is unset or names the
 * live dataset (see {@link contentDatasetOf}).
 */
export const sanityContentDataset = contentDatasetOf(
  process.env.NEXT_PUBLIC_SANITY_CONTENT_DATASET,
);

/** API version pinned for every client of this site. */
export const sanityApiVersion = "2024-03-01";

/**
 * Whether a real project is configured. Without one the fetch layers return
 * their empty or fallback values and make no request.
 */
export const isSanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

/** Where the embedded Studio's workspaces live (see src/sanity/sanity.config.ts). */
export const studioPaths = {
  /** Events, partners and research in the live dataset. */
  live: "/studio/live",
  /** The page content types in the content dataset. */
  content: "/studio/content",
} as const;
