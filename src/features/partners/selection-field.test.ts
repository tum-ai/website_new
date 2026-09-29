import { describe, expect, test } from "vitest";
import { admittedPerBatchOf, communityFacts } from "@/config/community";
import { selectionField } from "./selection-field";

const marks = communityFacts.startedApplicationsPerBatch;
const lit = admittedPerBatchOf(communityFacts);

describe("selectionField", () => {
  for (const columns of [70, 42]) {
    test(`draws every application and lights the admitted on ${columns} columns`, () => {
      const field = selectionField({ marks, lit, columns });
      expect((field.rows - 1) * field.columns + field.lastRow).toBe(marks);
      expect(field.lit).toHaveLength(lit);

      const indices = field.lit.map(
        ({ column, row }) => row * field.columns + column,
      );
      expect(new Set(indices).size).toBe(lit);
      for (const { column, row } of field.lit) {
        expect(column).toBeGreaterThanOrEqual(0);
        expect(column).toBeLessThan(field.columns);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(field.rows);
      }
    });

    test(`spreads the lit marks over the whole field on ${columns} columns`, () => {
      const field = selectionField({ marks, lit, columns });
      // Every quarter of the field, by rows and by columns, holds lit marks,
      // and none holds much more than its share.
      const share = lit / 4;
      for (const axis of ["row", "column"] as const) {
        const size = axis === "row" ? field.rows : field.columns;
        const counts = [0, 0, 0, 0];
        for (const cell of field.lit) {
          counts[Math.min(3, Math.floor((cell[axis] / size) * 4))] += 1;
        }
        for (const count of counts) {
          expect(count).toBeGreaterThan(share / 2);
          expect(count).toBeLessThan(share * 1.5);
        }
      }
    });
  }

  test("is deterministic, so server and client draw the same field", () => {
    const options = { marks, lit, columns: 70 };
    expect(selectionField(options)).toStrictEqual(selectionField(options));
  });

  test("ends a count that doesn't fill whole rows in a short last row", () => {
    const field = selectionField({ marks: 2101, lit: 48, columns: 70 });
    expect(field.rows).toBe(31);
    expect(field.lastRow).toBe(1);
    for (const { column, row } of field.lit) {
      expect(row * 70 + column).toBeLessThan(2101);
    }
  });

  test("rejects counts it can't draw", () => {
    expect(() => selectionField({ marks: 0, lit: 0, columns: 70 })).toThrow();
    expect(() => selectionField({ marks: 10, lit: 11, columns: 5 })).toThrow();
    expect(() => selectionField({ marks: 10, lit: 1, columns: 0 })).toThrow();
  });
});
