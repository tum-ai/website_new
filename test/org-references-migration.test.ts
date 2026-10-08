import { expect, test } from "vitest";
import {
  eventHostsListId,
  formerEventHostKeys,
  planOrgReferences,
} from "../scripts/sanity/org-references-plan";

const organizations = [
  {
    _id: "organization-example",
    key: "example",
    name: "Example Company",
    shortName: "Example",
  },
];
test("CMS names resolve references and each patch carries its read revision", () => {
  const result = planOrgReferences({
    organizations,
    documents: [
      { _id: "event", _type: "event", _rev: "r1", hosts: ["Example"] },
    ],
  });
  expect(result.create).toStrictEqual([]);
  expect(result.patches[0]).toMatchObject({
    id: "event",
    rev: "r1",
    set: {
      coHosts: [
        { _type: "reference", _ref: "organization-example", _key: "example" },
      ],
    },
  });
});
test("unmatched names are reported without inventing organizations or partial reference sets", () => {
  const result = planOrgReferences({
    organizations,
    documents: [
      { _id: "event", _type: "event", hosts: ["Example", "Missing"] },
    ],
  });
  expect(result.patches).toStrictEqual([]);
  expect(result.create).toStrictEqual([]);
  expect(result.unmatched).toMatchObject([
    { id: "event", path: "coHosts", detail: "Missing" },
  ]);
});
test("existing references survive and edited obsolete logo lists are preserved", () => {
  const result = planOrgReferences({
    organizations,
    documents: [
      {
        _id: "event",
        _type: "event",
        hosts: ["Example"],
        coHosts: [{ _ref: "edited" }],
      },
      {
        _id: eventHostsListId,
        _type: "logoList",
        organizations: [{ _ref: "edited" }],
      },
    ],
  });
  expect(result.patches).toStrictEqual([]);
  expect(result.deletes).toStrictEqual([]);
  expect(result.skipped).toHaveLength(1);
});
test("exact obsolete list is deleted only at the revision read", () => {
  const result = planOrgReferences({
    organizations,
    documents: [
      {
        _id: eventHostsListId,
        _type: "logoList",
        _rev: "r2",
        organizations: formerEventHostKeys.map((key) => ({
          _ref: `organization-${key}`,
        })),
      },
    ],
  });
  expect(result.deletes).toMatchObject([{ id: eventHostsListId, rev: "r2" }]);
});
test("person organization conversion keeps an unmatched role unchanged", () => {
  const result = planOrgReferences({
    organizations,
    documents: [{ _id: "person", _type: "person", role: "Builder @ Missing" }],
  });
  expect(result.patches).toStrictEqual([]);
});
