import { expect, test } from "vitest";
import { memberJourney } from "@/features/community";
import { faqs } from "./qanda";

/*
 * The member-journey answer retells the two tracks in its own words (it adds
 * a sentence the journey doesn't have), so it can't be derived from
 * `memberJourney`. This pins the shared part: each track's opening sentence.
 */
test("the member-journey answer opens each track with the journey's own sentence", () => {
  const answer = faqs.find((entry) => entry.id === "member-journey");
  const fork = memberJourney.find((stage) => stage.kind === "fork");
  if (!answer?.points || fork?.kind !== "fork") {
    throw new Error("expected the member-journey answer and the track fork");
  }
  expect(answer.points).toHaveLength(fork.steps.length);
  for (const step of fork.steps) {
    const [opening] = step.description.split(/(?<=\.)\s/);
    const sentence = `In the ${step.name.toLowerCase()} you will ${opening.charAt(0).toLowerCase()}${opening.slice(1)}`;
    expect(
      answer.points.some((point) => point.startsWith(sentence)),
      step.name,
    ).toBe(true);
  }
});
