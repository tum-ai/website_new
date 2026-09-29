import { describe, expect, test } from "vitest";
import { getMockResearchProjects, liveEventHosts } from "@/lib/mock-cms";
import { planInput } from "../scripts/sanity/migrate-org-references";
import {
  eventHostsListId,
  formatPlan,
  formerEventHostKeys,
  type PlanDataset,
  type PlannedPatch,
  planOrgReferences,
  type StoredDocument,
} from "../scripts/sanity/org-references-plan";
import { collectBackfill } from "../scripts/sanity/slices";

/**
 * The organisation-references migration (scripts/sanity/
 * org-references-plan.ts): a dataset filled before the references existed,
 * migrated, holds what today's backfill writes; names without an
 * organisation are listed, never invented, and editors' values stay.
 */

const input = planInput();
const introduced = new Set(
  input.newOrganizations.map(({ key }) => String(key)),
);
const backfill = new Map(collectBackfill().map((doc) => [doc._id, doc]));

function current(id: string): StoredDocument {
  const found = backfill.get(id);
  if (!found) throw new Error(`no backfill document ${id}`);
  return structuredClone(found) as StoredDocument;
}

/** The organisations of a dataset filled before this change. */
const organizations = collectBackfill()
  .filter(
    ({ _type, key }) =>
      _type === "organization" && !introduced.has(String(key)),
  )
  .map(({ _id, key, name, shortName }) => ({
    _id,
    key: String(key),
    name: String(name),
    ...(typeof shortName === "string" ? { shortName } : {}),
  }));

/** The lab sites' alias strings as the backfill wrote them before. */
const formerAliases: Record<string, string[]> = {
  "lab-site-munich": [
    "TUM",
    "TUM CAMP",
    "Helmholtz",
    "Helmholtz Zentrum",
    "Helmholtz Munich",
    "LMU",
    "LMU Klinikum",
    "Klinikum rechts der Isar",
    "MI4People",
  ],
  "lab-site-boston": [
    "MIT",
    "Harvard",
    "Harvard University",
    "Harvard Medical School",
  ],
  "lab-site-cambridge": ["University of Cambridge", "Cambridge"],
  "lab-site-san-jose": ["IBM Almaden"],
  "lab-site-zurich": ["IBM Research"],
  "lab-site-paris": ["Inria", "INRIA"],
};

function labSiteBefore(id: string): StoredDocument {
  const { organizations: _, ...site } = current(id);
  return { ...site, institutions: formerAliases[id] };
}

/** The people whose roles named their company, as the backfill wrote them. */
function personBefore(id: string, role: string, withOrganization = true) {
  const { roleAtOrganization: _, organization, ...person } = current(id);
  return {
    ...person,
    role,
    ...(withOrganization ? { organization } : {}),
  } as StoredDocument;
}

const peopleBefore = [
  personBefore("person-e-lab-testimonial-alexandra-reinert", "Partner @ Accel"),
  personBefore(
    "person-e-lab-testimonial-oliver-schoppe",
    "Principal @ UVC Partners",
  ),
  personBefore(
    "person-e-lab-testimonial-axel-taeubert",
    "Head of Startups @ Google Cloud",
  ),
  current("person-e-lab-testimonial-leon-hergert"),
  current("person-e-lab-testimonial-viktor-shen"),
  personBefore(
    "person-partner-profile-leonie-freisinger",
    "Co-Founder & CTO @Dryft",
    false,
  ),
  personBefore(
    "person-partner-profile-mohamed-elrefaie",
    "PhD Researcher @MIT",
    false,
  ),
  personBefore(
    "person-partner-profile-jasmin-el-wafi",
    "ML Consultant & Systems Architect @AWS",
    false,
  ),
  current("person-member-story-simon-huang"),
];

function taskForceBefore(): StoredDocument {
  const document = current("task-force-med-ai");
  return {
    ...document,
    work: {
      ...(document.work as Record<string, unknown>),
      partner: "Helmholtz Center Munich",
    },
  };
}

const researchBefore = getMockResearchProjects().map(
  ({ id, title }): StoredDocument => ({ _id: id, _type: "research", title }),
);

const eventsBefore = liveEventHosts.map(
  ({ title, hosts }, index): StoredDocument => ({
    _id: `event-${index}`,
    _type: "event",
    title,
    hosts: [...hosts],
  }),
);

const eventHostsList: StoredDocument = {
  _id: eventHostsListId,
  _type: "logoList",
  _rev: "r1",
  surface: "event-hosts",
  organizations: formerEventHostKeys.map((key) => ({
    _key: key,
    _type: "reference",
    _ref: `organization-${key}`,
  })),
};

function before(): PlanDataset {
  return {
    organizations,
    documents: [
      ...researchBefore,
      ...eventsBefore,
      ...Object.keys(formerAliases).map(labSiteBefore),
      ...peopleBefore,
      taskForceBefore(),
      eventHostsList,
    ],
  };
}

/** `document` with `patch` applied, as Sanity would (paths are dotted). */
function applied(document: StoredDocument, patch: PlannedPatch) {
  const copy = structuredClone(document) as Record<string, unknown>;
  for (const [path, value] of Object.entries(patch.set)) {
    const steps = path.split(".");
    let target = copy;
    for (const step of steps.slice(0, -1)) {
      target = target[step] as Record<string, unknown>;
    }
    target[steps.at(-1) as string] = value;
  }
  for (const path of patch.unset) delete copy[path];
  return copy as StoredDocument;
}

function migrate(dataset: PlanDataset) {
  const plan = planOrgReferences(input, dataset);
  const patches = new Map(plan.patches.map((patch) => [patch.id, patch]));
  const documents = dataset.documents.map((document) => {
    const patch = patches.get(document._id);
    return patch ? applied(document, patch) : document;
  });
  return { plan, documents };
}

const refKeys = (value: unknown) =>
  (value as { _key: string }[] | undefined)?.map(({ _key }) => _key);

describe("the organisation-references migration", () => {
  const { plan, documents } = migrate(before());
  const byId = new Map(documents.map((document) => [document._id, document]));

  test("research: the title's institutions become references", () => {
    const keys = Object.fromEntries(
      documents
        .filter(({ _type }) => _type === "research")
        .map(({ _id, institutions }) => [_id, refKeys(institutions)]),
    );
    expect(keys).toMatchObject({
      "mock-research-uav": ["university-of-cambridge"],
      "mock-research-sycophancy": ["ibm-almaden"],
      "mock-research-cells": ["helmholtz-munich"],
      "mock-research-surgical-video": ["tum-camp"],
      "mock-research-retro-rank": ["mit"],
      "mock-research-surgical-4d": ["lmu-klinikum", "tum-camp"],
      "mock-research-number-tokens": ["ibm-research"],
    });
    // The title stays: the old site reads it.
    expect(byId.get("mock-research-cells")?.title).toBe(
      researchBefore.find(({ _id }) => _id === "mock-research-cells")?.title,
    );
  });

  test("lab sites: the migrated sites are today's backfill", () => {
    // Added to the sites after the migration ran, with their own data change.
    const addedSince = new Set(["organization-ibm"]);
    for (const id of Object.keys(formerAliases)) {
      const site = byId.get(id);
      expect(site?.institutions, id).toBeUndefined();
      expect(site?.organizations, id).toStrictEqual(
        (current(id).organizations as { _ref: string }[] | undefined)?.filter(
          ({ _ref }) => !addedSince.has(_ref),
        ),
      );
    }
  });

  test("events: every live co-host finds its organisation", () => {
    for (const { _id, hosts, coHosts } of documents.filter(
      ({ _type }) => _type === "event",
    )) {
      expect(refKeys(coHosts)?.length, _id).toBe(
        new Set(hosts as string[]).size,
      );
    }
    // `hosts` stays for the old site.
    expect(byId.get("event-0")?.hosts).toStrictEqual(eventsBefore[0]?.hosts);
  });

  test("people and the task force: the migrated documents are today's backfill", () => {
    for (const { _id } of [...peopleBefore, taskForceBefore()]) {
      const migrated = byId.get(_id);
      const expected = current(_id);
      for (const field of [
        "role",
        "organization",
        "roleAtOrganization",
        "work",
      ]) {
        expect(migrated?.[field], `${_id} ${field}`).toStrictEqual(
          expected[field],
        );
      }
    }
  });

  test("a role held elsewhere than its organisation is left as written", () => {
    expect(plan.skipped.map(({ id }) => id)).toContain(
      "person-e-lab-testimonial-leon-hergert",
    );
  });

  test("creates only the introduced organisations a reference needs", () => {
    expect(plan.create.map(({ key }) => key).sort()).toStrictEqual(
      [...introduced].sort(),
    );
  });

  test("deletes the event-hosts list the backfill wrote", () => {
    expect(plan.deletes).toStrictEqual([
      expect.objectContaining({ id: eventHostsListId, rev: "r1" }),
    ]);
  });

  test("a second run plans nothing", () => {
    const again = planOrgReferences(input, {
      organizations: [
        ...organizations,
        ...plan.create.map(({ _id, key, name }) => ({
          _id,
          key: String(key),
          name: String(name),
        })),
      ],
      documents: documents.filter(({ _id }) => _id !== eventHostsListId),
    });
    expect(again.patches).toStrictEqual([]);
    expect(again.create).toStrictEqual([]);
    expect(again.unmatched).toStrictEqual([]);
  });

  test("the printed plan names every change", () => {
    const text = formatPlan(plan);
    expect(text).toContain("organization-helmholtz-munich");
    expect(text).toContain("coHosts");
  });
});

describe("what the migration leaves alone", () => {
  test("a co-host without an organisation keeps the event's names, listed", () => {
    const { plan } = migrate({
      organizations,
      documents: [
        {
          _id: "e",
          _type: "event",
          hosts: ["Amazon Web Services", "Nowhere GmbH"],
        },
        { _id: "f", _type: "event", hosts: ["Amazon Web Services"] },
      ],
    });
    expect(plan.unmatched).toStrictEqual([
      { id: "e", path: "coHosts", detail: "Nowhere GmbH" },
    ]);
    expect(plan.patches.map(({ id }) => id)).toStrictEqual(["f"]);
    expect(refKeys(plan.patches[0]?.set.coHosts)).toStrictEqual(["aws"]);
  });

  test("fields an editor filled keep their values", () => {
    const { plan } = migrate({
      organizations,
      documents: [
        {
          _id: "r",
          _type: "research",
          title: "MIT: Engines",
          institutions: [{ _key: "x", _type: "reference", _ref: "o" }],
        },
        {
          _id: "e",
          _type: "event",
          hosts: ["AWS"],
          coHosts: [{ _key: "x", _type: "reference", _ref: "o" }],
        },
        {
          _id: "p",
          _type: "person",
          role: "Partner @ Accel",
          organization: { _type: "reference", _ref: "organization-accel" },
          roleAtOrganization: false,
        },
      ],
    });
    expect(plan.patches).toStrictEqual([]);
  });

  test("a reference to an organisation the dataset lacks blocks its document", () => {
    const { plan } = migrate({
      organizations: organizations.filter(({ key }) => key !== "mit"),
      documents: [{ _id: "r", _type: "research", title: "MIT: Engines" }],
    });
    expect(plan.patches).toStrictEqual([]);
    expect(plan.blocked).toStrictEqual([
      { id: "r", path: "institutions", detail: "mit" },
    ]);
    expect(plan.create).toStrictEqual([]);
  });

  test("an edited event-hosts list is not deleted", () => {
    const { plan } = migrate({
      organizations,
      documents: [
        {
          ...eventHostsList,
          _id: `drafts.${eventHostsListId}`,
          organizations: [],
        },
      ],
    });
    expect(plan.deletes).toStrictEqual([]);
    expect(plan.skipped.map(({ id }) => id)).toStrictEqual([
      `drafts.${eventHostsListId}`,
    ]);
  });
});
