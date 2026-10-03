import type { ValidationContext } from "sanity";
import { describe, expect, test } from "vitest";
import { evaluateMockQuery } from "@/lib/cms-content-mock";
import {
  excerptProblem,
  validateQuotedStory,
  validateStoryExcerpt,
} from "./excerpt-rules";

const story = "I joined in 2021. Within a semester I led a team of seven.";

const documents = [
  { _id: "person-ada", _type: "person", story },
  { _id: "drafts.person-ada", _type: "person", story: "A draft story." },
  {
    _id: "homeCopy",
    _type: "homeCopy",
    join: {
      quotes: [
        {
          _key: "grace",
          person: { _type: "reference", _ref: "person-grace" },
          excerpt: "Someone else's words.",
        },
        {
          _key: "ada",
          person: { _type: "reference", _ref: "person-ada" },
          excerpt: "Within a semester I led a team of seven.",
        },
      ],
    },
  },
  {
    _id: "journeystep-03",
    _type: "journeyStep",
    number: "03",
    evidence: {
      person: { _type: "reference", _ref: "person-ada" },
      excerpt: "I joined in 2021.",
    },
  },
];

/** A validation context whose client runs GROQ over `documents` with groq-js. */
function contextOf(
  context: { document?: Record<string, unknown>; parent?: unknown },
  docs: readonly Record<string, unknown>[] = documents,
) {
  return {
    ...context,
    getClient: () => ({
      fetch: (query: string, params: Record<string, unknown> = {}) =>
        evaluateMockQuery(query, params, docs as never),
    }),
  } as unknown as ValidationContext;
}

const quote = (excerpt: string, ref = "person-ada") =>
  validateStoryExcerpt(
    excerpt,
    contextOf({ parent: { person: { _ref: ref }, excerpt } }),
  );

test("an excerpt must be a passage of the story", () => {
  expect(
    excerptProblem("Within a semester I led a team of seven.", story),
  ).toBe(true);
  expect(excerptProblem("I led a team of eight.", story)).toMatch(
    /word for word/,
  );
  expect(excerptProblem("Anything", null)).toBe(true);
  expect(excerptProblem(undefined, story)).toBe(true);
});

describe("the quote beside a member", () => {
  test("is checked against the member's published story", async () => {
    await expect(quote("I joined in 2021.")).resolves.toBe(true);
    await expect(quote("A draft story.")).resolves.toMatch(/word for word/);
    await expect(quote("I joined in 2022.")).resolves.toMatch(/word for word/);
  });

  test("waits for a member to be picked", async () => {
    await expect(
      validateStoryExcerpt("Anything", contextOf({ parent: {} })),
    ).resolves.toBe(true);
    await expect(quote("Anything", "person-unpublished")).resolves.toBe(true);
  });
});

describe("a member's story", () => {
  const edit = (text: string) =>
    validateQuotedStory(
      text,
      contextOf({ document: { _id: "drafts.person-ada", _type: "person" } }),
    );

  test("that keeps every quoted sentence passes", async () => {
    await expect(edit(`${story} Now I mentor others.`)).resolves.toBe(true);
  });

  test("names the quotes an edit would break", async () => {
    await expect(edit("I joined in 2021. I lead a team now.")).resolves.toBe(
      "No longer contains the sentence quoted by the homepage quote. After publishing, update that quote.",
    );
    await expect(edit("Something else entirely.")).resolves.toMatch(
      /the homepage quote and journey step 03/,
    );
  });
});
