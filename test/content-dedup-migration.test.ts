import { expect, test } from "vitest";
import {
  memberJourneyPoints,
  partnersCopyTexts,
  planContentDedup,
} from "../scripts/sanity/content-dedup-plan";

test("historical exact text and duration comparators migrate only unchanged source values", () => {
  const result = planContentDedup([
    {
      _id: "eLabCopy",
      _type: "eLabCopy",
      _rev: "r1",
      gates: {
        stages: [{ _key: "build", _type: "phaseStage", duration: "4 weeks" }],
      },
    },
    {
      _id: "partnersCopy",
      _type: "partnersCopy",
      sections: { people: { title: partnersCopyTexts.peopleTitle.before } },
    },
    {
      _id: "faq-qanda-member-journey",
      _type: "faq",
      anchor: "member-journey",
      points: [...memberJourneyPoints],
    },
  ]);
  expect(result.patches).toHaveLength(3);
  expect(result.patches[0]).toMatchObject({
    id: "eLabCopy",
    rev: "r1",
    set: {
      'gates.stages[_key=="build"].duration': { amount: 4, unit: "weeks" },
    },
  });
  expect(result.patches[1].set).toMatchObject({
    "sections.people.title": partnersCopyTexts.peopleTitle.after,
  });
});
test("editor modifications are preserved and reported", () => {
  const result = planContentDedup([
    {
      _id: "partnersCopy",
      _type: "partnersCopy",
      sections: { people: { title: "Edited title" } },
    },
    {
      _id: "eLabCopy",
      _type: "eLabCopy",
      gates: {
        stages: [
          { _key: "build", _type: "phaseStage", duration: "five weeks" },
        ],
      },
    },
  ]);
  expect(result.patches).toStrictEqual([]);
  expect(result.skipped).toHaveLength(2);
});
test("campaign event conversion is a weak reference and remains revision guarded", () => {
  const result = planContentDedup([
    {
      _id: "drafts.campaign-example",
      _type: "campaign",
      _rev: "r1",
      featuredEventId: " event-example ",
    },
  ]);
  expect(result.patches[0]).toMatchObject({
    rev: "r1",
    set: {
      featuredEvent: { _type: "reference", _ref: "event-example", _weak: true },
    },
    unset: ["featuredEventId"],
  });
});
