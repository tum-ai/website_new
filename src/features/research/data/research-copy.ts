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

/** The abstract's photo, set as the page's one figure. */
export const abstractFigure = {
  src: "/assets/innovation/robotics_discussion.webp",
  width: 1920,
  height: 1440,
  alt: "Four members around a table of laptops and robot arm parts, one of them sketching a diagram on a whiteboard, a paper open on the screen beside them.",
  // TODO(content): name the project and year so the caption can say which team this is.
  caption: "A research team working through a paper.",
};

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
