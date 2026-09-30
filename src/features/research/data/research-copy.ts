import type { ContentImage } from "@/lib/cms-content-model";
import { fillPageTokens } from "@/lib/content-copy";

/**
 * The /research page's own copy as code writes it: the code fallback of the
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
     * One sentence completing "We …", split at its commas into the steps of
     * the process. The clauses stay lower case: they continue the "We".
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

export const researchCopyTemplate: ResearchCopy = {
  hero: {
    title: "Research",
    lead: "Our members run research projects with university labs and industry research groups, and publish at {{impact.publicationVenues}}.",
  },
  partnersLabel: "Research partners",
  abstract: {
    label: "Abstract",
    statement:
      "Research at TUM.ai is done by students, together with the labs that ask the questions.",
    body: "In the research track, members join a team working on a question with a partner lab, contribute to the research and write it up for publication. {{running}}, and our members have published {{impact.publications}}+ papers so far.",
    runningOne: "One project is running now",
    runningMany: "{{count}} projects are running now",
  },
  /*
   * TODO(content): name the projects and years so the captions can say which
   * teams these are.
   */
  figurePanels: [
    {
      src: "/assets/innovation/robotics_arm.webp",
      width: 1533,
      height: 921,
      alt: "A 3D-printed robot arm holding a small object in its gripper, a member watching from beside it.",
      caption: "Testing a robot arm's grasp.",
    },
    {
      src: "/assets/innovation/robotics_discussion.webp",
      width: 1920,
      height: 1440,
      alt: "Four members around a table of laptops and robot arm parts, one of them sketching a diagram on a whiteboard, a paper open on the screen beside them.",
      caption: "Working through a paper at the whiteboard.",
    },
    {
      src: "/assets/homepage/IBM_visit.webp",
      width: 1920,
      height: 1440,
      alt: "About fifty members standing together in front of the IBM Innovation Studio sign.",
      caption: "Members at the IBM Innovation Studio.",
      objectPosition: "50% 55%",
    },
  ],
  ongoing: { title: "In progress", empty: "No ongoing projects" },
  completed: {
    title: "Completed",
    lead: "Finished projects and the papers that came out of them.",
  },
  rex: {
    title: "Research abroad",
    lead: "Our Research Exchange (REX) Program gives TUM.ai members the chance to do research abroad. Offers range from final theses to research internships with leading labs.",
    logosLabel: "Offers from labs at institutions like",
    processTitle: "How REX works",
    process: [
      "collect project proposals from our partners,",
      "inform members about the requirements and usual processes,",
      "preselect applicants based on prior relevant (research) experience,",
      "recommend them to our partner labs,",
      "and eventually support their journey abroad with alumni experience in visa processes, housing, etc.",
    ],
    origin:
      "REX started because members were already doing research abroad and recommending others to follow. It works because researchers in our network trust TUM.ai to send them curious minds, and introduce our members to their fields.",
  },
  closing: {
    title: "Add your lab to the list.",
    openSlot: "Your lab",
    partner: {
      audience: "For labs and research groups",
      text: "Propose a joint project and shape the research our members work on.",
    },
    student: {
      audience: "For students",
      text: "Join a project team, or go abroad with our Research Exchange Program.",
    },
  },
};

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
