/**
 * Where the site's Sanity content lives: one project, one dataset
 * (`NEXT_PUBLIC_SANITY_DATASET`; docs/adr/0009-cms-content-source.md).
 *
 * The redesign reads `redesign`, which holds everything it needs: copies of
 * the old site's `event`, `partner` and `research` documents and the page
 * content types (FAQs, campaigns, logos, copy). The default stays
 * `production`, the old site's dataset, because the deployments of `main`
 * and the existing environments rely on it. Nothing in this repository
 * writes to `production`, and page content never goes there: on
 * `production` the Studio does not register the content types and the
 * `sanity` content source renders the code content
 * ({@link datasetHoldsPageContent}).
 *
 * Only public values: this module is shared by the server fetch layers
 * (`lib/sanity.ts`, `lib/cms-content.ts`) and the Studio config, which runs
 * in the browser.
 */

/** The Sanity project; a placeholder keeps the clients constructible in tests. */
export const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id";

/**
 * The old site's dataset. The site on `main` renders every `event`,
 * `partner` and `research` document in it, so it never receives page content
 * and nothing here writes to it.
 */
export const legacyDataset = "production";

/** The dataset the site and the Studio read: `redesign` for the new site. */
export const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || legacyDataset;

/**
 * Whether `dataset` may hold the page content types: every dataset except
 * {@link legacyDataset}. On `production` the Studio has no content types and
 * the `sanity` content source renders the code content, so nobody can create
 * page content in the old site's dataset.
 */
export function datasetHoldsPageContent(dataset: string): boolean {
  return dataset.trim() !== legacyDataset;
}

/** {@link datasetHoldsPageContent} for the configured dataset. */
export const hasPageContent = datasetHoldsPageContent(sanityDataset);

/** API version pinned for every client of this site. */
export const sanityApiVersion = "2024-03-01";

/**
 * The client configuration every reader of the dataset shares: published
 * documents from the API CDN. `lib/sanity.ts` adds stega and Sanity Live on
 * top; `lib/cms-content.ts` uses it as is.
 */
export const sanityClientConfig = {
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: true,
  perspective: "published",
} as const;

/**
 * Whether a real project is configured. Without one the fetch layers return
 * their empty or fallback values and make no request.
 */
export const isSanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

/** Where the embedded Studio lives (src/sanity/sanity.config.ts). */
export const studioPath = "/studio";
