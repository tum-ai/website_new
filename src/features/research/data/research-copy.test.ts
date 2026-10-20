import { expect, test } from "vitest";
import { getAbstractBody } from "./research-copy";

const abstract = {
  label: "Example",
  statement: "Example",
  body: "Now: {{running}}.",
  runningOne: "one team",
  runningMany: "{{count}} teams",
};
test("abstract uses the supplied count and grammar", () => {
  expect(getAbstractBody(1, abstract)).toBe("Now: one team.");
  expect(getAbstractBody(4, abstract)).toBe("Now: 4 teams.");
  expect(getAbstractBody(0, abstract)).toBe("Now: 0 teams.");
});
