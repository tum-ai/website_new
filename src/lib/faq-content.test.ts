import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { type ContentTokens, contentTokenNames } from "./content-tokens";

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("next-sanity", () => ({
  createClient: () => ({ fetch: mocks.fetch }),
  defineQuery: (query: string) => query,
}));

const tokens = Object.fromEntries(
  contentTokenNames.map((name) => [name, `<${name}>`]),
) as ContentTokens;

const templates = [
  { question: "When?", answer: "Until {{eLab.deadline}}.", id: "deadline" },
  { question: "Who?", answer: "Anyone.", id: "who" },
];

async function loadFaqContent(source: string) {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "abc123");
  vi.stubEnv("NEXT_PUBLIC_SANITY_CONTENT_DATASET", "redesign");
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "");
  vi.resetModules();
  return import("./faq-content");
}

beforeEach(() => {
  mocks.fetch.mockReset();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

test("the backfill keeps the placeholders, the order and ids from the keys, not the wording", async () => {
  const { buildFaqBackfill } = await loadFaqContent("code");
  expect(buildFaqBackfill("e-lab", templates)).toStrictEqual([
    {
      _id: "faq-e-lab-deadline",
      _type: "faq",
      collection: "e-lab",
      order: 10,
      question: "When?",
      answer: "Until {{eLab.deadline}}.",
    },
    {
      _id: "faq-e-lab-who",
      _type: "faq",
      collection: "e-lab",
      order: 20,
      question: "Who?",
      answer: "Anyone.",
    },
  ]);
});

describe("getFaqs", () => {
  test("code: the templates with their placeholders filled, no request", async () => {
    const { getFaqs } = await loadFaqContent("code");
    await expect(
      getFaqs("e-lab", { templates, tokens }),
    ).resolves.toStrictEqual([
      { question: "When?", answer: "Until <eLab.deadline>." },
      { question: "Who?", answer: "Anyone." },
    ]);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  test("sanity: the collection's entries, placeholders filled", async () => {
    mocks.fetch.mockResolvedValue([
      { question: "New?", answer: "Closes {{eLab.deadline}}." },
    ]);
    const { getFaqs } = await loadFaqContent("sanity");
    await expect(
      getFaqs("apply", { templates, tokens }),
    ).resolves.toStrictEqual([
      { question: "New?", answer: "Closes <eLab.deadline>." },
    ]);
    expect(mocks.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "faq"'),
      { collection: "apply" },
      expect.anything(),
    );
  });

  test("sanity: drops entries with an unknown placeholder or no text", async () => {
    mocks.fetch.mockResolvedValue([
      { question: "Typo?", answer: "Closes {{eLab.dedline}}." },
      { question: "", answer: "No question" },
      { question: "No answer", answer: null },
      { question: "Kept?", answer: "Yes." },
    ]);
    const { getFaqs } = await loadFaqContent("sanity");
    await expect(
      getFaqs("apply", { templates, tokens }),
    ).resolves.toStrictEqual([{ question: "Kept?", answer: "Yes." }]);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Typo?"));
  });

  test("sanity: an empty collection renders the code list", async () => {
    mocks.fetch.mockResolvedValue([]);
    const { getFaqs } = await loadFaqContent("sanity");
    const faqs = await getFaqs("apply", { templates, tokens });
    expect(faqs.map(({ question }) => question)).toStrictEqual([
      "When?",
      "Who?",
    ]);
  });
});
