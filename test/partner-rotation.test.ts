import assert from "node:assert/strict";
import test from "node:test";
import { getPartnerDirectory } from "../src/lib/partner-directory";
import {
  createPartnerRotation,
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
