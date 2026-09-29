import { describe, expect, test } from "vitest";
import { memberJourney } from "@/features/community";
import { segmentPassage, spanProblems } from "@/lib/passage-spans";
import { faqs, qandaCopy } from "./qanda";

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

describe("the /qanda mission passage", () => {
  const { missionPassage } = qandaCopy;
  const spans = faqs.flatMap((faq) =>
    (faq.spans ?? []).map((text) => ({ id: faq.id, text })),
  );

  test("marks every span of every answer, once and without overlaps", () => {
    expect(spanProblems(missionPassage, spans)).toStrictEqual([]);
    const marked = segmentPassage(missionPassage, spans).filter(
      (segment) => segment.id,
    );
    expect(marked).toHaveLength(spans.length);
  });

  test("lists the questions in the order their answers appear", () => {
    const firstMark = (id: string) =>
      Math.min(
        ...spans
          .filter((span) => span.id === id)
          .map((span) => missionPassage.indexOf(span.text)),
      );
    const marked = faqs.filter((faq) => faq.spans?.length);
    const byPassage = [...marked].sort(
      (a, b) => firstMark(a.id) - firstMark(b.id),
    );
    expect(marked.map((faq) => faq.id)).toEqual(byPassage.map((faq) => faq.id));
  });

  test("gives every question a unique anchor id", () => {
    const ids = faqs.map((faq) => faq.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
