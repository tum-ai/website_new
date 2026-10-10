/** The page's own copy (`qandaCopy`). */
export type QandaCopy = {
  heroTitle: string;
  /** The question the mission passage answers. */
  missionQuestion: string;
  missionLead: string;
  /**
   * The long mission paragraph: the context passage every other answer is
   * marked in. Change it together with the answers' `spans`; the tests (and
   * the Studio) fail when a span no longer matches.
   */
  missionPassage: string;
  closing: { title: string; lead: string; action: string };
  /** Each reader's next step; the companies' text is `partnerPitch`. */
  forks: {
    students: { reader: string; text: string };
    companies: { reader: string };
  };
};

/** One question on /qanda. */
export type QandaEntry = {
  /** Anchor id of the question (`/qanda#<id>`). */
  id: string;
  question: string;
  /** The answer's opening paragraph. */
  answer: string;
  /** Points the answer lists after its opening sentence. */
  points?: readonly string[];
  /**
   * The phrases of the mission passage that answer the question, each an
   * exact substring that occurs once. Omit when the passage doesn't cover it.
   */
  spans?: readonly string[];
  /**
   * A fact that shows the answer (placeholders for the figures), and where
   * to see it.
   */
  evidence?: { text?: string; label: string; href: string };
};
