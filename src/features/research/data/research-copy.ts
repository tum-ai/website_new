import type { ContentImage } from "@/lib/cms-content-model";
import { fillPageTokens } from "@/lib/content-copy";

/**
 * The /research page's published CMS copy model for the
 * `researchCopy` singleton (see `../content.ts`). Text may hold `{{name}}`
 * placeholders for site facts, filled when the page renders; the abstract
 * body also holds page tokens (`researchPageTokens`) that
 * {@link getAbstractBody} fills from the running projects. The REX copy
 * (`rex.ts`) and the projects themselves (`research` documents) are separate.
 */

/** One panel of Figure 1: a photo and its part of the caption. */
export type FigurePanel = ContentImage & {
  /** The panel's part of the figure caption, after its "(a)" label. */
  caption: string;
};

export type ResearchCopy = {
  hero: { title: string; lead: string };
  /** The label over the research partners' logos. */
  partnersLabel: string;
  abstract: {
    label: string;
    statement: string;
    /** `{{running}}`: the running sentence below, for the project count. */
    body: string;
    /** The running sentence for one project. */
    runningOne: string;
    /** The running sentence for several; `{{count}}` in digits. */
    runningMany: string;
  };
  /** Figure 1 in the abstract: research as it happens. */
  figurePanels: FigurePanel[];
  ongoing: { title: string; empty: string };
  completed: { title: string; lead: string };
  /** The Research Exchange (REX) band; the institutions are its logo list. */
  rex: {
    title: string;
    /** Names the institutions the logos below repeat. */
    lead: string;
    logosLabel: string;
    processTitle: string;
    /**
     * The steps of the process, in order: each a capitalised clause that
     * opens with what we do, without closing punctuation.
     */
    process: string[];
    /** Why REX exists, in the program's own words. */
    origin: string;
  };
  /** The closing band: the affiliation line gets one more slot. */
  closing: {
    title: string;
    openSlot: string;
    partner: { audience: string; text: string };
    student: { audience: string; text: string };
  };
};

/** The page tokens of the /research copy (see `fillPageTokens`). */
export const researchPageTokens = ["running", "count"] as const;

/**
 * The abstract's body for `ongoingCount` running projects (the count comes
 * from the `research` documents): the running sentence in the singular or plural,
 * set into the body. `abstract` is the copy's, with its site facts filled.
 */
export function getAbstractBody(
  ongoingCount: number,
  abstract: ResearchCopy["abstract"],
): string {
  const running =
    ongoingCount === 1
      ? abstract.runningOne
      : fillPageTokens(abstract.runningMany, { count: String(ongoingCount) });
  return fillPageTokens(abstract.body, { running });
}
