/** Copy for the Research Exchange (REX) band on /research. */
import type { LogoItem } from "@/components/ds";

/** The REX lead. It names the institutions `rexInstitutions` repeats. */
export const rexLead =
  "Our Research Exchange (REX) Program gives TUM.ai members the chance to do research abroad. Offers range from final theses to research internships with leading labs.";

/**
 * Institutions the REX offers come from, as the lead's examples, with their
 * official logos (ratios from each SVG's viewBox).
 *
 * TODO(content): confirm we may show these four logos (Harvard, MIT and Inria
 * from Wikimedia Commons, the University of Cambridge from Wikipedia).
 */
export const rexInstitutions: LogoItem[] = [
  {
    name: "Harvard University",
    src: "/assets/research/rex/harvard.svg",
    aspectRatio: 600 / 165,
  },
  {
    name: "MIT",
    src: "/assets/research/rex/mit.svg",
    aspectRatio: 1473.281 / 829.367,
  },
  {
    name: "University of Cambridge",
    src: "/assets/research/rex/cambridge.svg",
    aspectRatio: 65.974 / 13.978,
  },
  {
    name: "Inria",
    src: "/assets/research/rex/inria.svg",
    aspectRatio: 283.46 / 82.75,
  },
];

/**
 * One sentence of the REX copy ("We …"), split at its commas into the steps
 * of the process. The clauses stay lower case: they continue the "We".
 */
export const rexProcess = [
  "collect project proposals from our partners,",
  "inform members about the requirements and usual processes,",
  "preselect applicants based on prior relevant (research) experience,",
  "recommend them to our partner labs,",
  "and eventually support their journey abroad with alumni experience in visa processes, housing, etc.",
];

/** Why REX exists, in the program's own words. */
export const rexOrigin =
  "REX started because members were already doing research abroad and recommending others to follow. It works because researchers in our network trust TUM.ai to send them curious minds, and introduce our members to their fields.";
