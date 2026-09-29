import { describe, expect, test } from "vitest";
import { memberJourney } from "@/features/community";
import { segmentPassage, spanProblems } from "@/lib/passage-spans";
import { faqs, qandaCopy } from "./qanda";

test("the member-journey answer lists the journey's tracks, in journey order", () => {
  const answer = faqs.find((entry) => entry.id === "member-journey");
  const fork = memberJourney.find((stage) => stage.kind === "fork");
  if (fork?.kind !== "fork") throw new Error("expected the track fork");
  expect(answer?.points).toHaveLength(fork.steps.length);
  fork.steps.forEach((step, index) => {
    const [opening] = step.description.split(/(?<=\.)\s/);
    expect(answer?.points?.[index]).toBe(
      `In the ${step.name.toLowerCase()} you will ${opening.charAt(0).toLowerCase()}${opening.slice(1)}`,
    );
  });
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
