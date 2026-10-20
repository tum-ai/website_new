import { evaluate, parse } from "groq-js";
import { describe, expect, it, vi } from "vitest";
import {
  assertHomeQuotesTarget,
  type HomeQuoteDocument,
  homeQuotesCompletionId,
  homeQuotesInput,
  homeQuotesPreflightRequest,
  PLAN_QUERY,
  type PlanInput,
  planHomeQuotes,
  projectHomeQuotes,
} from "../scripts/sanity/home-quotes-plan";
import {
  applyHomeQuotes,
  type HomeQuotesClient,
} from "../scripts/sanity/migrate-home-quotes-apply";

const target = { projectId: "testproject", dataset: "redesign" };
const person = {
  _id: "person-example-member",
  _type: "person",
  key: "example-member",
  name: "Example Member",
  placement: "member-story",
  story: "I built a small project with the team. We shared what we learned.",
};
const legacy = {
  person: { _type: "reference", _ref: person._id },
  excerpt: "I built a small project with the team.",
};
const input = (): PlanInput => ({
  documents: [
    {
      _id: "homeCopy",
      _type: "homeCopy",
      _rev: "home-revision",
      join: { quote: structuredClone(legacy) },
    },
  ],
  people: [structuredClone(person)],
});
const clientFor = (state: PlanInput) => {
  let revision = 0;
  const client: HomeQuotesClient = {
    read: vi.fn(async () => structuredClone(state)),
    convert: vi.fn(async (patch, completion) => {
      const doc = state.documents.find(({ _id }) => _id === patch.id);
      if (!doc || doc._rev !== patch.rev) throw new Error("Revision conflict");
      doc.join = { ...doc.join, quotes: [patch.quote] };
      delete doc.join.quote;
      doc._rev = `home-updated-${++revision}`;
      state.completion = { ...completion, _rev: `receipt-${revision}` };
    }),
    finish: vi.fn(async (completion) => {
      state.completion = { ...completion, _rev: `receipt-${++revision}` };
    }),
  };
  return client;
};

describe("CMS-only home quote migration", () => {
  it("preserves exactly the existing CMS quote, without appending unrelated member stories", () => {
    const source = input();
    source.people.push({ ...person, _id: "person-other", key: "other" });
    const before = structuredClone(source);
    const plan = planHomeQuotes(source, target);
    expect(plan.blocked).toEqual([]);
    expect(plan.patches).toEqual([
      {
        id: "homeCopy",
        rev: "home-revision",
        quote: { _key: "legacy-member-quote", _type: "memberQuote", ...legacy },
      },
    ]);
    expect(source).toEqual(before);
  });

  it.each([[], null, [{ _key: "edited", excerpt: "Editor-set quote" }]])(
    "preserves editor-set join.quotes %j wholesale",
    (quotes) => {
      const source = input();
      source.documents[0].join = { quote: structuredClone(legacy), quotes };
      const plan = planHomeQuotes(source, target);
      expect(plan.patches).toEqual([]);
      expect(plan.blocked).toEqual([]);
    },
  );

  it.each([
    [
      "missing quote",
      (source: PlanInput) => {
        source.documents[0].join = {};
      },
    ],
    [
      "missing reference",
      (source: PlanInput) => {
        source.documents[0].join = { quote: { excerpt: legacy.excerpt } };
      },
    ],
    [
      "wrong placement",
      (source: PlanInput) => {
        source.people[0].placement = "partner-profile";
      },
    ],
    [
      "missing name",
      (source: PlanInput) => {
        source.people[0].name = "";
      },
    ],
    [
      "missing key",
      (source: PlanInput) => {
        source.people[0].key = "";
      },
    ],
    [
      "absent published person",
      (source: PlanInput) => {
        source.people = [];
      },
    ],
    [
      "unrelated excerpt",
      (source: PlanInput) => {
        source.people[0].story = "Another story.";
      },
    ],
    [
      "missing revision",
      (source: PlanInput) => {
        delete source.documents[0]._rev;
      },
    ],
  ])("blocks %s with no invented quote", (_, change) => {
    const source = input();
    change(source);
    const plan = planHomeQuotes(source, target);
    expect(plan.patches).toEqual([]);
    expect(plan.blocked).toHaveLength(1);
  });

  it("rejects the production target and malformed receipt instead of guessing", () => {
    expect(() =>
      assertHomeQuotesTarget({ ...target, dataset: "production" }),
    ).toThrow(/Refusing/);
    expect(() => assertHomeQuotesTarget({ ...target, dataset: "" })).toThrow(
      /explicitly/,
    );
    const source = input();
    source.completion = { _id: homeQuotesCompletionId };
    expect(() => planHomeQuotes(source, target)).toThrow(/completion record/);
  });

  it("uses published people for both document variants, excluding draft identities and versions", async () => {
    const source = input();
    const documents = [
      ...source.documents,
      {
        ...source.documents[0],
        _id: "drafts.homeCopy",
        _rev: "draft-revision",
      },
      person,
      { ...person, _id: `drafts.${person._id}`, name: "Draft name" },
      { ...person, _id: `versions.release.${person._id}` },
    ];
    const result = (await (
      await evaluate(parse(PLAN_QUERY), { dataset: documents })
    ).get()) as PlanInput;
    expect(result.people).toEqual([
      expect.objectContaining({ name: person.name }),
    ]);
    expect(
      planHomeQuotes(result, target, { draftVisibility: "verified" }).patches,
    ).toHaveLength(2);
    expect(homeQuotesInput(documents).people).toHaveLength(1);
  });

  it("reports public draft visibility unknown and authenticated raw visibility explicitly", () => {
    const publicRead = homeQuotesPreflightRequest(target);
    expect(publicRead.url.searchParams.get("perspective")).toBe("published");
    expect(publicRead.draftVisibility).toBe("unknown");
    expect(publicRead.init).toBeUndefined();
    const authenticated = homeQuotesPreflightRequest(target, "read-token");
    expect(authenticated.url.searchParams.get("perspective")).toBe("raw");
    expect(authenticated.draftVisibility).toBe("verified");
  });

  it("projects a single required array in memory while preserving other CMS values", () => {
    const source = input();
    const docs: HomeQuoteDocument[] = [...source.documents, person];
    const plan = planHomeQuotes(source, target);
    const projected = projectHomeQuotes(plan, docs);
    expect(projected[0].join).toEqual({ quotes: [plan.patches[0].quote] });
    expect(docs[0].join).toEqual({ quote: legacy });
    expect(projected[1]).toEqual(person);
    expect(() =>
      projectHomeQuotes(plan, [{ ...docs[0], _rev: "changed" }]),
    ).toThrow(/Stale/);
  });

  it("atomically receipts a conversion and never restores a later editor unset", async () => {
    const source = input();
    const client = clientFor(source);
    await expect(applyHomeQuotes(target, client)).resolves.toEqual({
      converted: 1,
      failures: [],
    });
    expect(source.completion).toMatchObject({
      complete: true,
      completed: ["homeCopy"],
    });
    source.documents[0].join = { quote: legacy }; // Editor removed the new field; old data is not a seed.
    await expect(applyHomeQuotes(target, client)).resolves.toEqual({
      converted: 0,
      failures: [],
    });
    expect(client.convert).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])(
    "guards initially existing array after later unset or document deletion (%s)",
    async (deleteDocument) => {
      const source = input();
      source.documents[0].join = { quote: legacy, quotes: [] };
      const client = clientFor(source);
      await expect(applyHomeQuotes(target, client)).resolves.toEqual({
        converted: 0,
        failures: [],
      });
      expect(source.completion).toMatchObject({ complete: true });
      if (deleteDocument) source.documents = [];
      else delete source.documents[0].join?.quotes;
      await expect(applyHomeQuotes(target, client)).resolves.toEqual({
        converted: 0,
        failures: [],
      });
      expect(client.convert).not.toHaveBeenCalled();
    },
  );

  it("keeps failed writes retryable and refuses to finalize the completion receipt", async () => {
    const source = input();
    const client = clientFor(source);
    vi.mocked(client.convert).mockRejectedValueOnce(
      new Error("Revision conflict"),
    );
    const result = await applyHomeQuotes(target, client);
    expect(result.failures).toEqual([
      expect.stringContaining("Revision conflict"),
    ]);
    expect(client.finish).not.toHaveBeenCalled();
    expect(source.completion).toBeUndefined();
    await expect(applyHomeQuotes(target, client)).resolves.toEqual({
      converted: 1,
      failures: [],
    });
  });

  it("receipts partial progress across published and draft retries without reseeding completed work", async () => {
    const source = input();
    source.documents.push({
      ...structuredClone(source.documents[0]),
      _id: "drafts.homeCopy",
      _rev: "draft-revision",
    });
    const client = clientFor(source);
    const convert = client.convert;
    client.convert = vi.fn(async (patch, completion) => {
      if (patch.id === "drafts.homeCopy") throw new Error("Draft conflict");
      return convert(patch, completion);
    });
    expect((await applyHomeQuotes(target, client)).failures).toHaveLength(1);
    expect(source.completion).toMatchObject({ completed: ["homeCopy"] });
    expect(source.completion?.complete).toBeUndefined();
    source.documents[0].join = { quote: legacy };
    client.convert = convert;
    await expect(applyHomeQuotes(target, client)).resolves.toEqual({
      converted: 1,
      failures: [],
    });
    expect(source.documents[0].join?.quotes).toBeUndefined();
    expect(source.completion).toMatchObject({
      complete: true,
      completed: ["homeCopy", "drafts.homeCopy"],
    });
  });
});
