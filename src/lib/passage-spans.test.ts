import { describe, expect, test } from "vitest";
import { segmentPassage, spanProblems } from "./passage-spans";

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

describe("spanProblems", () => {
  test("accepts spans that occur once and don't overlap", () => {
    expect(
      spanProblems(passage, [
        { id: "build", text: "We build" },
        { id: "found", text: "we found" },
      ]),
    ).toStrictEqual([]);
  });

  test("reports every span that can't be marked, with the reason", () => {
    const problems = spanProblems(passage, [
      { id: "missing", text: "we research" },
      { id: "twice", text: "we" },
      { id: "a", text: "we teach, and" },
      { id: "b", text: "and we found" },
    ]);
    expect(problems.map(({ span, problem }) => [span.id, problem])).toEqual([
      ["missing", expect.stringMatching(/not in the passage/)],
      ["twice", expect.stringMatching(/more than once/)],
      ["b", expect.stringMatching(/overlap/)],
    ]);
  });
});
