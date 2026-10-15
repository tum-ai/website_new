import { beforeEach, expect, test, vi } from "vitest";
import { evaluateMockQuery, getMockContentDocuments } from "./cms-content-mock";
import { ContentError } from "./cms-content-model";
import {
  getDepartments,
  JOURNEY_QUERY,
  parseMemberEvidence,
  selectMemberJourney,
} from "./community-content";

const steps = async () =>
  evaluateMockQuery<Record<string, unknown>[]>(
    JOURNEY_QUERY,
    {},
    await getMockContentDocuments(),
  );
beforeEach(() => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
});
test("the real journey query resolves quoted member identity and words", async () => {
  const journey = selectMemberJourney(await steps());
  expect(journey.map(({ kind }) => kind)).toEqual(["single", "fork"]);
  const fork = journey.find((stage) => stage.kind === "fork");
  expect(fork?.steps[0].evidence).toEqual({
    key: "example-member",
    name: "Example Member",
    excerpt: "I built a small project with the team.",
  });
});
test("a missing journey or a list without a fork cannot be drawn", async () => {
  expect(() => selectMemberJourney([])).toThrow(ContentError);
  const raw = await steps();
  expect(() => selectMemberJourney(raw.slice(0, 1))).toThrow(/fork/);
});
test("every stage remains adjacent and every step anchor unique", async () => {
  const raw = await steps();
  expect(() => selectMemberJourney([raw[0], raw[1], raw[0], raw[2]])).toThrow(
    /unique|adjacent/,
  );
  expect(() => selectMemberJourney([raw[1], raw[0], raw[2]])).toThrow(
    /adjacent/,
  );
});
test("more than two tracks or more than one fork fails structurally", async () => {
  const raw = await steps();
  expect(() =>
    selectMemberJourney([...raw, { ...raw[2], step: "03" }]),
  ).toThrow(/fork/);
  expect(() =>
    selectMemberJourney([
      ...raw,
      { ...raw[1], step: "03A", stage: 3 },
      { ...raw[2], step: "03B", stage: 3 },
    ]),
  ).toThrow(/fork/);
});
test.each([
  { iconKey: "unknown" },
  { fromSemester: -1 },
  { fromSemester: 1.5 },
  { stage: 0 },
  { step: "invalid" },
  { description: "" },
  { span: "never" },
])("invalid required step fields fail: %j", async (change) => {
  const raw = await steps();
  expect(() =>
    selectMemberJourney([{ ...raw[0], ...change }, ...raw.slice(1)]),
  ).toThrow(ContentError);
});
test("optional evidence can be cleared and cannot invent an attribution", () => {
  expect(parseMemberEvidence(null, "journey")).toBeUndefined();
  expect(() =>
    parseMemberEvidence(
      {
        key: "author",
        name: "Author",
        excerpt: "Words",
        story: "Different",
        placement: "member-story",
      },
      "journey",
    ),
  ).toThrow(/word for word/);
  expect(() =>
    parseMemberEvidence(
      {
        key: "author",
        name: "Author",
        excerpt: "Words",
        story: "Words",
        placement: "e-lab-testimonial",
      },
      "journey",
    ),
  ).toThrow(/member story/);
});
test("department query resolves optional photos", async () => {
  const result = await getDepartments({} as never);
  expect(result[0]).toMatchObject({
    name: "Example team",
    photo: { src: "/assets/fixtures/photo.svg" },
  });
});
