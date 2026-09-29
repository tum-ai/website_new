import { describe, expect, test } from "vitest";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { formatDuration, isDuration } from "@/lib/program-duration";
import {
  formatPlan,
  memberJourneyPoints,
  organizationFacts,
  type PlannedPatch,
  partnersCopyTexts,
  planContentDedup,
  type StoredDocument,
} from "../scripts/sanity/content-dedup-plan";
import { collectBackfill } from "../scripts/sanity/slices";

/**
 * The content-dedup migration (scripts/sanity/content-dedup-plan.ts): a
 * dataset filled by the backfill before the dedup changes, migrated, holds
 * what today's backfill writes; fields an editor changed are left alone.
 */

const clone = <T>(value: T): T => structuredClone(value);

/** Today's backfill documents the migration touches, by `_id`. */
const current = new Map(
  collectBackfill()
    .filter(({ _id }) =>
      [
        "eLabCopy",
        "siteSettings",
        "partnersCopy",
        "faq-qanda-member-journey",
      ].includes(_id),
    )
    .map((document) => [document._id, document]),
);

function document(id: string): StoredDocument {
  const found = current.get(id);
  if (!found) throw new Error(`no backfill document ${id}`);
  return clone(found) as StoredDocument;
}

/** The documents as the backfill wrote them before the dedup changes. */
function beforeDedup(): StoredDocument[] {
  const eLab = document("eLabCopy") as StoredDocument & {
    gates: { stages: Record<string, unknown>[] };
  };
  for (const stage of eLab.gates.stages) {
    if (isDuration(stage.duration)) {
      stage.duration = formatDuration(stage.duration);
    }
  }
  const settings = document("siteSettings") as StoredDocument & {
    organization: Record<string, unknown>;
  };
  for (const field of Object.keys(organizationFacts)) {
    delete settings.organization[field];
  }
  let partners = JSON.stringify(document("partnersCopy"));
  for (const { before, after } of Object.values(partnersCopyTexts)) {
    partners = partners.replaceAll(
      JSON.stringify(after),
      JSON.stringify(before),
    );
  }
  const faq = {
    ...document("faq-qanda-member-journey"),
    points: [...memberJourneyPoints],
  };
  return [eLab, settings, JSON.parse(partners), faq];
}

/** A Sanity patch path (`a.b[_key=="k"].c`) as steps. */
const steps = (path: string) =>
  [...path.matchAll(/([^.[\]]+)|\[_key=="([^"]+)"\]/g)].map((match) =>
    match[2] === undefined ? match[1] : { key: match[2] },
  );

/** `document` with `patch` applied, as Sanity would. */
function applied(document: StoredDocument, patch: PlannedPatch) {
  const result = clone(document) as Record<string, unknown>;
  const walk = (path: string, write: (parent: never, last: never) => void) => {
    const route = steps(path);
    let node: unknown = result;
    for (const step of route.slice(0, -1)) {
      node =
        typeof step === "string"
          ? (node as Record<string, unknown>)[step]
          : (node as { _key: string }[]).find(({ _key }) => _key === step.key);
    }
    write(node as never, route.at(-1) as never);
  };
  for (const [path, value] of Object.entries(patch.set)) {
    walk(path, (parent: Record<string, unknown>, last: string) => {
      parent[last] = value;
    });
  }
  for (const path of patch.unset) {
    walk(path, (parent: Record<string, unknown>, last: string) => {
      delete parent[last];
    });
  }
  return result;
}

describe("the content-dedup migration", () => {
  test("turns the documents the backfill wrote into what it writes now", () => {
    const documents = beforeDedup();
    const { patches, skipped } = planContentDedup(documents);
    expect(skipped).toStrictEqual([]);
    expect(patches.map(({ id }) => id)).toStrictEqual([
      "eLabCopy",
      "siteSettings",
      "partnersCopy",
      "faq-qanda-member-journey",
    ]);
    for (const patch of patches) {
      const before = documents.find(({ _id }) => _id === patch.id);
      if (!before) throw new Error(patch.id);
      expect(applied(before, patch), patch.id).toStrictEqual(
        current.get(patch.id) as BackfillDocument,
      );
    }
  });

  test("today's backfill needs no migration", () => {
    expect(
      planContentDedup([...current.values()] as StoredDocument[]),
    ).toStrictEqual({ patches: [], skipped: [] });
  });

  test("a field an editor changed is left alone and listed", () => {
    const [eLab, settings, partners, faq] = beforeDedup();
    const edited = clone(partners) as unknown as StoredDocument & {
      sections: { people: { title: string } };
    };
    edited.sections.people.title = "The top talent.";
    const stages = (eLab.gates as { stages: Record<string, unknown>[] }).stages;
    const phase = stages.find((stage) => stage._type === "phaseStage");
    if (phase) phase.duration = "five weeks";
    const { patches, skipped } = planContentDedup([
      eLab,
      { ...settings, organization: { acceptanceRate: 3 } },
      edited,
      { ...faq, points: ["An editor's point."] },
    ]);
    expect(skipped).toStrictEqual([
      {
        id: "eLabCopy",
        path: `gates.stages[_key=="${phase?._key}"].duration`,
        value: "five weeks",
      },
      {
        id: "partnersCopy",
        path: "sections.people.title",
        value: "The top talent.",
      },
      {
        id: "faq-qanda-member-journey",
        path: "points",
        value: ["An editor's point."],
      },
    ]);
    const settingsPatch = patches.find(({ id }) => id === "siteSettings");
    expect(settingsPatch?.set).toStrictEqual({
      "organization.linkedinAudience": organizationFacts.linkedinAudience,
    });
  });

  test("a campaign's featured event id becomes a weak reference", () => {
    const campaign = {
      _id: "drafts.campaign-makeathon",
      _type: "campaign",
      _rev: "r1",
      name: "Makeathon",
      featuredEventId: " event-makeathon ",
    };
    const { patches } = planContentDedup([campaign]);
    expect(patches).toStrictEqual([
      {
        id: "drafts.campaign-makeathon",
        rev: "r1",
        set: {
          featuredEvent: {
            _type: "reference",
            _ref: "event-makeathon",
            _weak: true,
          },
        },
        unset: ["featuredEventId"],
        changes: [
          {
            path: "featuredEvent",
            before: undefined,
            after: { _type: "reference", _ref: "event-makeathon", _weak: true },
          },
          {
            path: "featuredEventId",
            before: " event-makeathon ",
            after: undefined,
          },
        ],
      },
    ]);
    expect(
      planContentDedup([{ _id: "campaign-x", _type: "campaign" }]).patches,
    ).toStrictEqual([]);
  });

  test("drafts are planned like their published documents", () => {
    const [eLab] = beforeDedup();
    const { patches } = planContentDedup([
      { ...eLab, _id: "drafts.eLabCopy", _rev: "d1" },
    ]);
    expect(patches.map(({ id, rev }) => [id, rev])).toStrictEqual([
      ["drafts.eLabCopy", "d1"],
    ]);
  });

  test("the printed plan shows each change as before and after", () => {
    const text = formatPlan(planContentDedup(beforeDedup()));
    expect(text).toContain("sections.people.title");
    expect(text).toContain(`before: "${partnersCopyTexts.peopleTitle.before}"`);
    expect(text).toContain(`after:  "${partnersCopyTexts.peopleTitle.after}"`);
    expect(text).toMatch(/change\(s\) in 4 document\(s\), 0 left alone\.$/);
  });
});
