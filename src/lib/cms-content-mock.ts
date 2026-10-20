import { evaluate, parse } from "groq-js";
import { getFixtureDocuments } from "./cms-fixtures";
import type { CmsFixtureDocument } from "./cms-fixtures/types";

/** Independent CMS-shaped fixtures, loaded only behind the literal build-time mock gate. */
export function getMockContentDocuments(): CmsFixtureDocument[] {
  return getFixtureDocuments();
}

/** Evaluate the actual production query over synthetic documents, including references. */
export async function evaluateMockQuery<T>(
  query: string,
  params: Record<string, unknown>,
  documents: readonly CmsFixtureDocument[],
): Promise<T> {
  const result = await evaluate(parse(query, { params }), {
    dataset: documents,
    params,
  });
  return (await result.get()) as T;
}
