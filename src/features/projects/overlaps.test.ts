import { describe, expect, test } from "vitest";
import { taskForces } from "./data/projects";
import {
  AI_RADIUS,
  figureExtent,
  LABEL_HALF_HEIGHT,
  layoutSeats,
  SEAT_DISTANCE,
  type Seat,
  seatRadius,
} from "./overlaps";

const distance = (x: number, y: number) => Math.hypot(x, y);

// The page seats every task force plus one open seat; the ring must also
// hold when task forces are added or retired.
const pageCount = taskForces.length + 1;
const counts = [3, 4, 5, 6, 7, 8, pageCount];

describe.each(counts)("a ring of %i seats", (count) => {
  const seats = layoutSeats(count);

  test("every seat sits the same distance from the origin, clockwise from the top", () => {
    expect(seats).toHaveLength(count);
    for (const seat of seats) {
      expect(distance(seat.cx, seat.cy)).toBeCloseTo(SEAT_DISTANCE, 6);
    }
    expect(seats[0]?.cx).toBeCloseTo(0, 6);
    expect(seats[0]?.cy).toBeCloseTo(-SEAT_DISTANCE, 6);
    // Clockwise on screen (y down): the second seat is to the right of the first.
    expect(seats[1]?.cx).toBeGreaterThan(0);
  });

  test("every seat overlaps the AI circle, so each lens exists", () => {
    const r = seatRadius(count);
    expect(SEAT_DISTANCE).toBeGreaterThan(AI_RADIUS - r);
    expect(SEAT_DISTANCE).toBeLessThan(AI_RADIUS + r);
  });

  test("each lens is thick enough to read as a shape", () => {
    const r = seatRadius(count);
    expect(AI_RADIUS + r - SEAT_DISTANCE).toBeGreaterThanOrEqual(
      0.2 * AI_RADIUS,
    );
  });

  test("neighbouring seats never touch", () => {
    seats.forEach((seat, i) => {
      const next = seats[(i + 1) % count] as Seat;
      const gap =
        distance(next.cx - seat.cx, next.cy - seat.cy) - seat.r - next.r;
      expect(gap).toBeGreaterThan(0);
    });
  });

  test("the crossings lie on both circles", () => {
    for (const seat of seats) {
      for (const point of seat.crossings) {
        expect(distance(point.x, point.y)).toBeCloseTo(AI_RADIUS, 6);
        expect(distance(point.x - seat.cx, point.y - seat.cy)).toBeCloseTo(
          seat.r,
          6,
        );
      }
    }
  });

  test("label boxes sit in the crescent: inside their seat, clear of the AI circle", () => {
    for (const seat of seats) {
      const { x, y, width } = seat.label;
      const halfHeight = LABEL_HALF_HEIGHT * seat.r;
      expect(width).toBeGreaterThan(0.5 * seat.r);
      // Every corner of the label's box lies inside the seat and outside AI.
      for (const cornerX of [x - width / 2, x + width / 2]) {
        for (const cornerY of [y - halfHeight, y + halfHeight]) {
          expect(
            distance(cornerX - seat.cx, cornerY - seat.cy),
          ).toBeLessThanOrEqual(seat.r);
          expect(distance(cornerX, cornerY)).toBeGreaterThanOrEqual(AI_RADIUS);
        }
      }
    }
  });

  test("the figure's square holds every seat", () => {
    const e = figureExtent(count);
    for (const seat of seats) {
      expect(Math.abs(seat.cx) + seat.r).toBeLessThan(e);
      expect(Math.abs(seat.cy) + seat.r).toBeLessThan(e);
    }
  });
});

test("the lens path runs from one crossing along both arcs and back", () => {
  const [seat] = layoutSeats(pageCount);
  if (!seat) throw new Error("no seat");
  const [first, second] = seat.crossings;
  const round = (value: number) => Number(value.toFixed(3));
  expect(seat.lens).toBe(
    `M ${round(first.x)} ${round(first.y)} A ${AI_RADIUS} ${AI_RADIUS} 0 0 0 ${round(second.x)} ${round(second.y)} A ${round(seat.r)} ${round(seat.r)} 0 0 0 ${round(first.x)} ${round(first.y)} Z`,
  );
  // The top seat's first crossing is on the right, so a counter-clockwise
  // arc (sweep 0) runs over the top: through the lens, not around the circle.
  expect(first.x).toBeGreaterThan(0);
});
