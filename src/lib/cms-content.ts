import "server-only";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "next-sanity";
import { ContentError } from "./cms-content-model";
import {
  hasPageContent,
  isSanityConfigured,
  sanityClientConfig,
} from "./sanity-config";

/** Published CMS client; configuration is checked at the reader boundary. */
let clientConfigurationError: unknown;
export const contentClient = (() => {
  try {
    return createClient(sanityClientConfig);
  } catch (error) {
    clientConfigurationError = error;
    return createClient({
      ...sanityClientConfig,
      projectId: "test-project-id",
      dataset: "production",
    });
  }
})();
export type FetchContentOptions = {
  query: string;
  params?: Record<string, unknown>;
  tags: string[];
  revalidate?: number | false;
  label: string;
};
/** Read published CMS content or explicitly selected local synthetic fixtures. */
export async function fetchContent<T>({
  query,
  params = {},
  tags,
  revalidate,
  label,
}: FetchContentOptions): Promise<T> {
  if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL) {
    const { evaluateMockQuery, getMockContentDocuments } = await import(
      "./cms-content-mock"
    );
    return evaluateMockQuery<T>(query, params, await getMockContentDocuments());
  }
  if (clientConfigurationError)
    throw new ContentError(
      label,
      "configuration",
      "invalid Sanity project or dataset configuration",
      { cause: clientConfigurationError },
    );
  if (!isSanityConfigured)
    throw new ContentError(
      label,
      "configuration",
      "NEXT_PUBLIC_SANITY_PROJECT_ID is required",
    );
  if (!process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || !hasPageContent)
    throw new ContentError(
      label,
      "configuration",
      "NEXT_PUBLIC_SANITY_DATASET must explicitly select a page-content dataset (not production)",
    );
  try {
    return await contentClient.fetch<T>(query, params, {
      next: { tags, ...(revalidate === undefined ? {} : { revalidate }) },
    });
  } catch (error) {
    unstable_rethrow(error);
    throw new ContentError(
      label,
      "request",
      "could not fetch published CMS content",
      { cause: error },
    );
  }
}
export type LoadContentOptions<T, R> = FetchContentOptions & {
  select: (result: R) => T;
};
/** Read and validate a complete slice, without filling missing fields from local content. */
export async function loadContent<T, R>({
  select,
  ...options
}: LoadContentOptions<T, R>): Promise<T> {
  return select(await fetchContent<R>(options));
}
