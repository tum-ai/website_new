import { openSeat, taskForces } from "./projects";

const numberWords = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

/** A count as a sentence-initial word ("Five"), or digits past ten. */
function countWord(count: number) {
  return numberWords[count] ?? String(count);
}

/** The /projects hero. */
export const hero = {
  eyebrow: "Task forces",
  title: "Where AI meets another field.",
  lead: `Task forces are small teams of TUM.ai members who take AI into one other field, through research projects, sessions, hackathons and expeditions. ${countWord(taskForces.length)} run today, and one circle is open for the next.`,
  figureLabel: "Jump to a task force",
};

/** The seats of the figure: the task forces clockwise from the top, then the open one. */
export const figureSeats = [
  ...taskForces.map(({ slug, name, field }) => ({ slug, name, field })),
  { ...openSeat, open: true },
];

const withPartner = taskForces.find((taskForce) => taskForce.work)?.work;

/** The page's close: the open seat, and what each audience can do next. */
export const closing = {
  title: "The open circle is yours.",
  lead: "Members found task forces. After your first semester, you can lead one, or start the next in the field you bring.",
  student: {
    audience: "For students",
    text: "Join TUM.ai, work in a task force, and bring your own field into it.",
  },
  partner: {
    audience: "For partners",
    text: withPartner
      ? `Bring a problem from your field. Task forces already work with partners such as ${withPartner.partner}.`
      : "Bring a problem from your field, and a task force can take it on.",
  },
};
