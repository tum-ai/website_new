import { assert, expect, test } from "vitest";
import { getPartnerDirectory } from "./partner-directory";
import {
  createPartnerRotation,
  nextPartnerBatch,
  nextPartnerRotation,
} from "./partner-rotation";

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

test("small and duplicate rosters stay static with no empty slots", () => {
  for (const keys of [
    [],
    ["a"],
    ["a", "b"],
    ["a", "b", "c"],
    ["a", "a", "b"],
  ]) {
    const state = createPartnerRotation(keys);
    expect(state.visible).toStrictEqual([...new Set(keys)]);
    expect(nextPartnerRotation(state)).toBeNull();
  }
});

test("rotation stays unique, fair and changes positions across long seeded runs", () => {
  for (const size of [4, 5, 7, 8, 20]) {
    for (const seed of [1, 42, 257]) {
      const random = seeded(seed);
      let state = createPartnerRotation(
        Array.from({ length: size }, (_, i) => `partner-${i}`),
      );
      const seen = new Map<string, Set<number>>();
      let previousSlot = -1;
      let group: number[] = [];
      for (let i = 0; i < 3000; i++) {
        const next = nextPartnerRotation(state, random);
        assert.exists(next);
        expect(state.visible).not.toContain(next.incoming);
        expect(next.incoming).not.toBe(next.outgoing);
        expect(next.slot).not.toBe(previousSlot);
        expect(new Set(next.state.visible).size).toBe(3);
        const eligible = Object.keys(state.appearances).filter(
          (key) => !state.visible.includes(key),
        );
        expect(state.appearances[next.incoming]).toBe(
          Math.min(...eligible.map((key) => state.appearances[key])),
        );
        group.push(next.slot);
        if (group.length === 3) {
          expect(new Set(group).size).toBe(3);
          group = [];
        }
        const slots = seen.get(next.incoming) ?? new Set<number>();
        slots.add(next.slot);
        seen.set(next.incoming, slots);
        state = next.state;
        previousSlot = next.slot;
      }
      const counts = Object.values(state.appearances);
      if (size >= 6) {
        expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(
          2,
        );
      }
      for (const slots of seen.values()) expect(slots.size).toBe(3);
    }
  }
});

test("company aliases consolidate across CMS categories and preserve requested tiers", () => {
  const partners = getPartnerDirectory([
    { id: "1", name: "McKinsey" },
    { id: "2", name: "McKinsey and Company" },
    { id: "3", name: "Entire" },
    { id: "4", name: "Entire.io" },
    { id: "5", name: "Amazon Web Services" },
    { id: "6", name: "BMW Group" },
    { id: "7", name: "janestreet" },
    { id: "8", name: "IBM" },
    { id: "9", name: "ibm" },
  ]);
  expect(partners).toHaveLength(18);
  for (const [name, tier] of [
    ["Entire.io", "gold"],
    ["McKinsey & Company", "silver"],
    ["AWS", "silver"],
    ["BMW", "silver"],
    ["Jane Street", "silver"],
    ["IBM", "bronze"],
  ]) {
    expect(partners.find((partner) => partner.name === name)?.tier).toBe(tier);
  }
});

test("supporter batches reserve outgoing companies and change multiple distinct slots fairly", () => {
  for (const capacity of [9, 12, 15, 18]) {
    for (const size of [
      capacity,
      capacity + 1,
      capacity + 4,
      capacity * 2 + 7,
    ]) {
      let state = createPartnerRotation(
        Array.from({ length: size }, (_, index) => `supporter-${index}`),
        capacity,
      );
      const random = seeded(capacity + size);
      if (size === capacity) {
        expect(nextPartnerBatch(state, capacity / 3, random)).toBeNull();
        continue;
      }
      const seen = new Set(state.visible);
      for (let step = 0; step < 1000; step++) {
        const batch = nextPartnerBatch(state, capacity / 3, random);
        assert.exists(batch);
        expect(batch.changes.length).toBeLessThanOrEqual(capacity / 3);
        expect(batch.changes.length).toBeLessThanOrEqual(size - capacity);
        if (size >= capacity * 2) {
          expect(batch.changes).toHaveLength(capacity / 3);
        }
        expect(new Set(batch.changes.map((change) => change.slot)).size).toBe(
          batch.changes.length,
        );
        const allOnScreen = [
          ...batch.state.visible,
          ...batch.changes.map((change) => change.outgoing),
        ];
        expect(new Set(allOnScreen).size).toBe(allOnScreen.length);
        for (const [index, change] of batch.changes.entries()) {
          expect(state.visible).not.toContain(change.incoming);
          expect(change.outgoing).toBe(state.visible[change.slot]);
          expect(change.delay).toBe(index * 90);
          seen.add(change.incoming);
        }
        state = batch.state;
      }
      expect(seen.size).toBe(size);
      if (size >= capacity * 2) {
        const counts = Object.values(state.appearances);
        expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(
          2,
        );
      }
    }
  }
});
