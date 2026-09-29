import { afterEach, describe, expect, test, vi } from "vitest";
import { getDepartments, getMemberJourney } from "./community-content";
import type { Department, JourneyStage } from "./community-model";
import { type ContentTokens, contentTokenNames } from "./content-tokens";
import { personId } from "./person-content";

const contentTokens = Object.fromEntries(
  contentTokenNames.map((name) => [name, `<${name}>`]),
) as ContentTokens;

/**
 * The shared getters with CMS documents that differ from the code (the
 * parity tests in `features/community/content.test.ts` cover the equal
 * case). The mock CMS serves the backfill of the fallback passed in, edited
 * by `tamper`. One getter per test: a mocked module imported by concurrent
 * calls reaches only the first of them.
 */
const tamper = vi.hoisted(() => ({
  edit: null as null | ((document: Record<string, unknown>) => unknown),
}));

vi.mock("./cms-content-mock", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./cms-content-mock")>();
  return {
    ...actual,
    evaluateMockQuery: (
      query: string,
      params: Record<string, unknown>,
      documents: readonly Record<string, unknown>[],
    ) =>
      actual.evaluateMockQuery(
        query,
        params,
        (tamper.edit ? documents.map(tamper.edit) : documents) as never,
      ),
  };
});

afterEach(() => {
  tamper.edit = null;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function useSanity() {
  vi.stubEnv("CMS_CONTENT_SOURCE", "sanity");
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const step = (step: string) => ({
  step,
  name: `Step ${step}`,
  description: "A step.",
  iconKey: "rocket" as const,
  fromSemester: 1,
  span: "ongoing" as const,
});

const journey: JourneyStage[] = [
  { kind: "single", step: { ...step("01"), fromSemester: 0, span: "event" } },
  { kind: "fork", steps: [step("02A"), step("02B")] },
  {
    kind: "single",
    step: { ...step("03"), evidence: { name: "Ada", excerpt: "I built it." } },
  },
];

const departments: Department[] = [
  { name: "Events", description: "Runs {{community.makeathonSize}} seats." },
  {
    name: "Venture",
    description: "Runs the E-Lab.",
    photo: {
      src: "/assets/homepage/elab.webp",
      width: 1920,
      height: 1440,
      alt: "A room",
      objectPosition: "50% 40%",
    },
    photoCaption: "Demo day",
  },
];

/** The member story the evidence of step 03 references. */
const people = () => [
  {
    _id: personId("member-story", "ada"),
    _type: "person",
    placement: "member-story",
    key: "ada",
    name: "Ada",
  },
];

describe("getMemberJourney", () => {
  test("rebuilds the stages from the CMS steps", async () => {
    useSanity();
    await expect(
      getMemberJourney(journey, contentTokens, { people }),
    ).resolves.toStrictEqual(journey);
  });

  test("keeps a step whose evidence references no member, without it", async () => {
    useSanity();
    const served = await getMemberJourney(journey, contentTokens);
    expect(served[2]).toStrictEqual({
      kind: "single",
      step: step("03"),
    });
  });

  test("serves an edited step", async () => {
    useSanity();
    tamper.edit = (document) =>
      document.number === "03"
        ? { ...document, name: "Lead a team" }
        : document;
    const served = await getMemberJourney(journey, contentTokens);
    expect(served[2]).toMatchObject({ step: { name: "Lead a team" } });
  });

  test("drops a step with an unknown icon or duration", async () => {
    useSanity();
    tamper.edit = (document) =>
      document.number === "03" ? { ...document, iconKey: "star" } : document;
    expect(await getMemberJourney(journey, contentTokens)).toHaveLength(2);
  });

  test("renders the code journey when a stage has three steps", async () => {
    useSanity();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    tamper.edit = (document) => ({ ...document, stage: 1 });
    await expect(
      getMemberJourney(journey, contentTokens, { people }),
    ).resolves.toStrictEqual(journey);
    expect(warn).toHaveBeenCalled();
  });
});

describe("getDepartments", () => {
  const filled = [
    {
      ...departments[0],
      description: `Runs ${contentTokens["community.makeathonSize"]} seats.`,
    },
    departments[1],
  ];

  test("fills placeholders and keeps the photos, from either source", async () => {
    await expect(
      getDepartments(departments, contentTokens),
    ).resolves.toStrictEqual(filled);
    useSanity();
    await expect(
      getDepartments(departments, contentTokens),
    ).resolves.toStrictEqual(filled);
  });

  test("drops a department without a name", async () => {
    useSanity();
    tamper.edit = (document) =>
      document.name === "Events" ? { ...document, name: null } : document;
    await expect(
      getDepartments(departments, contentTokens),
    ).resolves.toStrictEqual([departments[1]]);
  });
});
