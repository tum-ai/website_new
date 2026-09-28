import { expect, test } from "vitest";
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

/*
 * The long runs check their invariants with plain comparisons and assert once
 * per run: tens of thousands of `expect()` calls took seconds and timed out on
 * loaded CI runners, while the seeded runs themselves take milliseconds.
 */
test("rotation stays unique, fair and changes positions across long seeded runs", () => {
  for (const size of [4, 5, 7, 8, 20]) {
    for (const seed of [1, 42, 257]) {
      const random = seeded(seed);
      let state = createPartnerRotation(
        Array.from({ length: size }, (_, i) => `partner-${i}`),
      );
      const seen = new Map<string, Set<number>>();
      const failures = new Set<string>();
      let previousSlot = -1;
      let group: number[] = [];
      for (let i = 0; i < 3000; i++) {
        const next = nextPartnerRotation(state, random);
        if (!next) {
          failures.add("ran out of partners");
          break;
        }
        if (state.visible.includes(next.incoming))
          failures.add("incoming was already visible");
        if (next.incoming === next.outgoing)
          failures.add("incoming replaced itself");
        if (next.slot === previousSlot)
          failures.add("same slot twice in a row");
        if (new Set(next.state.visible).size !== 3)
          failures.add("wall lost a unique slot");
        const eligible = Object.keys(state.appearances).filter(
          (key) => !state.visible.includes(key),
        );
        if (
          state.appearances[next.incoming] !==
          Math.min(...eligible.map((key) => state.appearances[key]))
        )
          failures.add("incoming was not among the least shown");
        group.push(next.slot);
        if (group.length === 3) {
          if (new Set(group).size !== 3)
            failures.add("a round of three repeated a slot");
          group = [];
        }
        const slots = seen.get(next.incoming) ?? new Set<number>();
        slots.add(next.slot);
        seen.set(next.incoming, slots);
        state = next.state;
        previousSlot = next.slot;
      }
      const run = `size ${size}, seed ${seed}`;
      expect([...failures], run).toStrictEqual([]);
      const counts = Object.values(state.appearances);
      if (size >= 6) {
        expect(
          Math.max(...counts) - Math.min(...counts),
          run,
        ).toBeLessThanOrEqual(2);
      }
      expect(
        [...seen.values()].every((slots) => slots.size === 3),
        run,
      ).toBe(true);
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
      const run = `capacity ${capacity}, size ${size}`;
      if (size === capacity) {
        expect(nextPartnerBatch(state, capacity / 3, random), run).toBeNull();
        continue;
      }
      const seen = new Set(state.visible);
      const failures = new Set<string>();
      for (let step = 0; step < 1000; step++) {
        const batch = nextPartnerBatch(state, capacity / 3, random);
        if (!batch) {
          failures.add("ran out of supporters");
          break;
        }
        const { changes } = batch;
        if (changes.length > capacity / 3) failures.add("batch too large");
        if (changes.length > size - capacity)
          failures.add("batch larger than the hidden pool");
        if (size >= capacity * 2 && changes.length !== capacity / 3)
          failures.add("full pool gave a short batch");
        if (
          new Set(changes.map((change) => change.slot)).size !== changes.length
        )
          failures.add("batch reused a slot");
        const allOnScreen = [
          ...batch.state.visible,
          ...changes.map((change) => change.outgoing),
        ];
        if (new Set(allOnScreen).size !== allOnScreen.length)
          failures.add("a company is on screen twice");
        for (const [index, change] of changes.entries()) {
          if (state.visible.includes(change.incoming))
            failures.add("incoming was already visible");
          if (change.outgoing !== state.visible[change.slot])
            failures.add("outgoing is not the slot's company");
          if (change.delay !== index * 90) failures.add("stagger is off");
          seen.add(change.incoming);
        }
        state = batch.state;
      }
      expect([...failures], run).toStrictEqual([]);
      expect(seen.size, run).toBe(size);
      if (size >= capacity * 2) {
        const counts = Object.values(state.appearances);
        expect(
          Math.max(...counts) - Math.min(...counts),
          run,
        ).toBeLessThanOrEqual(2);
      }
    }
  }
});
