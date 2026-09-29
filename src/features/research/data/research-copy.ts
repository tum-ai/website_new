/** Copy for /research outside the REX band. Facts come from config. */
import { impactFacts, publicationVenuesText } from "@/config/impact";

/** The hero lead under "Research". */
export const heroLead = `Our members run research projects with university labs and industry research groups, and publish at ${publicationVenuesText}.`;

/** The abstract's opening statement. */
export const abstractStatement =
  "Research at TUM.ai is done by students, together with the labs that ask the questions.";

/** The abstract's body; the number of running projects comes from the CMS. */
export function getAbstractBody(ongoingCount: number): string {
  const running =
    ongoingCount === 1
      ? "One project is running now"
      : `${ongoingCount} projects are running now`;
  return `In the research track, members join a team working on a question with a partner lab, contribute to the research and write it up for publication. ${running}, and our members have published ${impactFacts.publications}+ papers so far.`;
}

/** One panel of Figure 1: a photo with its intrinsic size. */
export type FigurePanel = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** The panel's part of the figure caption, after its "(a)" label. */
  caption: string;
  /** `object-position` when the panel crops the photo. */
  position?: string;
};

/**
 * Figure 1 in the abstract: research as it happens, in three panels.
 *
 * TODO(content): name the projects and years so the captions can say which
 * teams these are.
 */
export const figurePanels: FigurePanel[] = [
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
    position: "50% 55%",
  },
];

/** The closing band: the affiliation line gets one more slot. */
export const closing = {
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
};
