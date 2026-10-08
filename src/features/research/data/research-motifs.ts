import type { ResearchProject } from "@/lib/types";

/**
 * A research tile motif's key, as the Studio offers it (the `motif` options
 * of the research schema). `research-motifs.tsx` draws one per key.
 */
export type ResearchMotif = NonNullable<ResearchProject["motif"]>;

/* Keyed by the schema's union, so adding an option there fails the
   typecheck here until the site knows the key. */
const motifKeys: Record<ResearchMotif, true> = {
  "camera-frustum": true,
  "vector-field": true,
  "decision-tree": true,
  "nested-clusters": true,
  "long-timeline": true,
  "splat-graph": true,
  "phase-diagram": true,
};

/** Every motif key the site draws, in the Studio's order. */
export const researchMotifKeys = Object.keys(motifKeys) as ResearchMotif[];

/**
 * Whether a CMS value names a motif this site draws. A key the Studio no
 * longer offers (or any other string written through the API) is not one,
 * and the tile stays plain.
 */
export function isResearchMotif(value: unknown): value is ResearchMotif {
  return typeof value === "string" && Object.hasOwn(motifKeys, value);
}
