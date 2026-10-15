/**
 * Marked phrases in a passage: /qanda marks, in its mission paragraph, the
 * words that answer each question. A mark is stored as the quoted text, not
 * as offsets, so an editor can read and fix it; this module checks that the
 * text still occurs in the passage (the Studio validation and the tests use
 * {@link spanProblems}) and cuts the passage into runs for rendering.
 * Isomorphic: the Studio schemas import it too.
 */

/** A phrase to mark in a passage, owned by the question with `id`. */
export type MarkedSpan = { id: string; text: string };

/**
 * A run of the passage: plain text, or a marked span with the id of the
 * question it answers. `start` is the run's offset in the passage.
 */
export type PassageSegment = {
  text: string;
  start: number;
  /** The question this span answers; absent on plain text. */
  id?: string;
};

/**
 * A span that cannot be marked, and why; for an overlap, `with` is the
 * earlier span it runs into.
 */
export type SpanProblem = {
  span: MarkedSpan;
  problem: string;
  with?: MarkedSpan;
};

/**
 * Every span that cannot be marked in `passage`: one that is empty or not
 * in the passage, occurs more than once, or overlaps another span. An empty
 * list means {@link segmentPassage} accepts them.
 */
export function spanProblems(
  passage: string,
  spans: readonly MarkedSpan[],
): SpanProblem[] {
  const problems: SpanProblem[] = [];
  const placed: { span: MarkedSpan; start: number; end: number }[] = [];
  for (const span of spans) {
    const start = span.text ? passage.indexOf(span.text) : -1;
    if (start === -1) {
      problems.push({
        span,
        problem: `Span not in the passage: "${span.text}"`,
      });
    } else if (passage.indexOf(span.text, start + 1) !== -1) {
      problems.push({
        span,
        problem: `Span occurs more than once: "${span.text}"`,
      });
    } else {
      placed.push({ span, start, end: start + span.text.length });
    }
  }
  placed.sort((a, b) => a.start - b.start);
  let previous: (typeof placed)[number] | undefined;
  for (const entry of placed) {
    if (previous && entry.start < previous.end) {
      problems.push({
        span: entry.span,
        problem: `Spans overlap at: "${entry.span.text}"`,
        with: previous.span,
      });
    }
    if (!previous || entry.end > previous.end) previous = entry;
  }
  return problems;
}

/**
 * Cuts `passage` into plain and marked runs, in reading order. Each span must
 * occur in the passage exactly once and must not overlap another; anything
 * else throws, so a copy edit that breaks a mark fails the build instead of
 * silently dropping it.
 */
export function segmentPassage(
  passage: string,
  spans: readonly MarkedSpan[],
): PassageSegment[] {
  const [first] = spanProblems(passage, spans);
  if (first) throw new Error(first.problem);

  const placed = spans
    .map((span) => {
      const start = passage.indexOf(span.text);
      return { ...span, start, end: start + span.text.length };
    })
    .sort((a, b) => a.start - b.start);

  const segments: PassageSegment[] = [];
  let cursor = 0;
  for (const span of placed) {
    if (span.start > cursor) {
      segments.push({ text: passage.slice(cursor, span.start), start: cursor });
    }
    segments.push({ text: span.text, start: span.start, id: span.id });
    cursor = span.end;
  }
  if (cursor < passage.length) {
    segments.push({ text: passage.slice(cursor), start: cursor });
  }
  return segments;
}
