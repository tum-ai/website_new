import { expect, test } from "vitest";
import { backfillContentImage, keyedItems } from "./content-backfill";

test("a code image becomes an uploading image field with its alt and hotspot", () => {
  const field = backfillContentImage({
    src: "/assets/favicon.svg",
    width: 1,
    height: 1,
    alt: "Logo",
    objectPosition: "50% 20%",
  });
  expect(field._sanityAsset).toMatch(
    /^image@file:\/\/.*\/public\/assets\/favicon\.svg$/,
  );
  expect(field.alt).toBe("Logo");
  expect(field.hotspot).toMatchObject({ x: 0.5, y: 0.2 });
});

test("list items get their type and a key, from the position or a stable key", () => {
  expect(keyedItems("step", [{ a: 1 }, { a: 2 }])).toStrictEqual([
    { _key: "0", _type: "step", a: 1 },
    { _key: "1", _type: "step", a: 2 },
  ]);
  expect(
    keyedItems("step", [{ name: "Research Track" }], (item) => item.name),
  ).toStrictEqual([
    { _key: "research-track", _type: "step", name: "Research Track" },
  ]);
});
