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
 * Cuts `passage` into plain and marked runs, in reading order. Each span must
 * occur in the passage exactly once and must not overlap another; anything
 * else throws, so a copy edit that breaks a mark fails the build instead of
 * silently dropping it.
 */
export function segmentPassage(
  passage: string,
  spans: readonly MarkedSpan[],
): PassageSegment[] {
  const placed = spans
    .map((span) => {
      const start = passage.indexOf(span.text);
      if (!span.text || start === -1) {
        throw new Error(`Span not in the passage: "${span.text}"`);
      }
      if (passage.indexOf(span.text, start + 1) !== -1) {
        throw new Error(`Span occurs more than once: "${span.text}"`);
      }
      return { ...span, start, end: start + span.text.length };
    })
    .sort((a, b) => a.start - b.start);

  const segments: PassageSegment[] = [];
  let cursor = 0;
  for (const span of placed) {
    if (span.start < cursor) {
      throw new Error(`Spans overlap at: "${span.text}"`);
    }
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
