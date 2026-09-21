import assert from "node:assert/strict";
import test from "node:test";
import { getPartnerDirectory } from "../src/lib/partner-directory";
import {
  createPartnerRotation,
  nextPartnerBatch,
  nextPartnerRotation,
} from "../src/lib/partner-rotation";

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
    assert.deepEqual(state.visible, [...new Set(keys)]);
    assert.equal(nextPartnerRotation(state), null);
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
        assert.ok(next);
        assert.ok(!state.visible.includes(next.incoming));
        assert.notEqual(next.incoming, next.outgoing);
        assert.notEqual(next.slot, previousSlot);
        assert.equal(new Set(next.state.visible).size, 3);
        const eligible = Object.keys(state.appearances).filter(
          (key) => !state.visible.includes(key),
        );
        assert.equal(
          state.appearances[next.incoming],
          Math.min(...eligible.map((key) => state.appearances[key])),
        );
        group.push(next.slot);
        if (group.length === 3) {
          assert.equal(new Set(group).size, 3);
          group = [];
        }
        const slots = seen.get(next.incoming) ?? new Set<number>();
        slots.add(next.slot);
        seen.set(next.incoming, slots);
        state = next.state;
        previousSlot = next.slot;
      }
      const counts = Object.values(state.appearances);
      if (size >= 6) assert.ok(Math.max(...counts) - Math.min(...counts) <= 2);
      for (const slots of seen.values()) assert.equal(slots.size, 3);
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
  assert.equal(partners.length, 18);
  for (const [name, tier] of [
    ["Entire.io", "gold"],
    ["McKinsey & Company", "silver"],
    ["AWS", "silver"],
    ["BMW", "silver"],
    ["Jane Street", "silver"],
    ["IBM", "bronze"],
  ]) {
    assert.equal(partners.find((partner) => partner.name === name)?.tier, tier);
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
        assert.equal(nextPartnerBatch(state, capacity / 3, random), null);
        continue;
      }
      const seen = new Set(state.visible);
      for (let step = 0; step < 1000; step++) {
        const batch = nextPartnerBatch(state, capacity / 3, random);
        assert.ok(batch);
        assert.ok(batch.changes.length <= capacity / 3);
        assert.ok(batch.changes.length <= size - capacity);
        if (size >= capacity * 2)
          assert.equal(batch.changes.length, capacity / 3);
        assert.equal(
          new Set(batch.changes.map((change) => change.slot)).size,
          batch.changes.length,
        );
        const allOnScreen = [
          ...batch.state.visible,
          ...batch.changes.map((change) => change.outgoing),
        ];
        assert.equal(new Set(allOnScreen).size, allOnScreen.length);
        for (const [index, change] of batch.changes.entries()) {
          assert.ok(!state.visible.includes(change.incoming));
          assert.equal(change.outgoing, state.visible[change.slot]);
          assert.equal(change.delay, index * 90);
          seen.add(change.incoming);
        }
        state = batch.state;
      }
      assert.equal(seen.size, size);
      if (size >= capacity * 2) {
        const counts = Object.values(state.appearances);
        assert.ok(Math.max(...counts) - Math.min(...counts) <= 2);
      }
    }
  }
});
