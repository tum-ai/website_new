import { describe, expect, test } from "vitest";
import { faqs, missionPassage } from "./data/qanda";
import { segmentPassage } from "./mission-spans";

const passage = "We build, we teach, and we found.";

describe("segmentPassage", () => {
  test("cuts the passage into plain and marked runs in reading order", () => {
    const segments = segmentPassage(passage, [
      { id: "found", text: "we found" },
      { id: "build", text: "We build" },
    ]);
    expect(segments).toEqual([
      { text: "We build", start: 0, id: "build" },
      { text: ", we teach, and ", start: 8 },
      { text: "we found", start: 24, id: "found" },
      { text: ".", start: 32 },
    ]);
    expect(segments.map((segment) => segment.text).join("")).toBe(passage);
  });

  test("returns the passage whole when nothing is marked", () => {
    expect(segmentPassage(passage, [])).toEqual([{ text: passage, start: 0 }]);
  });

  test("rejects a span the passage doesn't contain", () => {
    expect(() =>
      segmentPassage(passage, [{ id: "x", text: "we research" }]),
    ).toThrow(/not in the passage/);
  });

  test("rejects an empty span", () => {
    expect(() => segmentPassage(passage, [{ id: "x", text: "" }])).toThrow(
      /not in the passage/,
    );
  });

  test("rejects a span that occurs more than once", () => {
    expect(() => segmentPassage(passage, [{ id: "x", text: "we" }])).toThrow(
      /more than once/,
    );
  });

  test("rejects overlapping spans", () => {
    expect(() =>
      segmentPassage(passage, [
        { id: "a", text: "we teach, and" },
        { id: "b", text: "and we found" },
      ]),
    ).toThrow(/overlap/);
  });
});

describe("the /qanda mission passage", () => {
  const spans = faqs.flatMap((faq) =>
    (faq.spans ?? []).map((text) => ({ id: faq.id, text })),
  );

  test("marks every span of every answer, once and without overlaps", () => {
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
