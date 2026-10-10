/** The rows of the programme matrix: what kind of thing members started. */
export const milestoneKinds = [
  { id: "research", label: "Research" },
  { id: "programs", label: "Programs" },
  { id: "events", label: "Events and hackathons" },
  { id: "organization", label: "Organization" },
] as const;

export type MilestoneKind = (typeof milestoneKinds)[number]["id"];

/** One thing TUM.ai's members started, in the year they started it. */
export type Milestone = {
  year: number;
  kind: MilestoneKind;
  /** A few words, set in the matrix cell. */
  title: string;
  /** The rest of the fact, under the title. */
  detail?: string;
};

/** The years a matrix of `list` spans, oldest first, with no gaps. */
export function milestoneYearsOf(list: readonly Milestone[]): number[] {
  if (list.length === 0) return [];
  const years = list.map((milestone) => milestone.year);
  const first = Math.min(...years);
  return Array.from(
    { length: Math.max(...years) - first + 1 },
    (_, index) => first + index,
  );
}

/** The milestones of `list` in one matrix cell, in list order. */
export const milestonesIn = (
  list: readonly Milestone[],
  kind: MilestoneKind,
  year: number,
) =>
  list.filter(
    (milestone) => milestone.kind === kind && milestone.year === year,
  );
