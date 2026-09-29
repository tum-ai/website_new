import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { expect, test } from "vitest";

import {
  eLabApplicationsCloseAt,
  eLabCompletedIterations,
  eLabConfig,
  eLabPhaseCopy,
  eLabProgramSummary,
  isApplicationWindowOpen,
} from "../src/config/e-lab.ts";
import { recruitingTimeline } from "../src/config/membership.ts";
import {
  officialMembers,
  organizationFacts,
} from "../src/config/organization.ts";
import { faq as applyFaq } from "../src/features/apply/data/faq.ts";
import { faq as eLabFaq } from "../src/features/e-lab/data/faq.ts";
import { testimonialCards } from "../src/features/e-lab/data/venture-page.ts";
import { getPartnersCopy } from "../src/features/partners/content.ts";
import { faqs as qandaFaqs } from "../src/features/qanda/data/qanda.ts";
import { parseMunichDateTime } from "../src/lib/munich-time.ts";

test("Munich wall-clock times resolve summer and winter time", () => {
  expect(parseMunichDateTime("26.09.2026", "23:59").toISOString()).toBe(
    "2026-09-26T21:59:00.000Z",
  );
  expect(parseMunichDateTime("15.01.2027", "12:00").toISOString()).toBe(
    "2027-01-15T11:00:00.000Z",
  );
  expect(() => parseMunichDateTime("2026-09-26", "23:59")).toThrow();
});

test("E-Lab applications close exactly at the configured deadline", () => {
  expect(eLabApplicationsCloseAt).toStrictEqual(
    parseMunichDateTime(
      eLabConfig.applicationDeadlineDate,
      eLabConfig.applicationDeadlineTime,
    ),
  );

  // The window model, pinned to the E-Lab 6.0 round (27.09.2026 at 22:00).
  const closesAt = parseMunichDateTime("27.09.2026", "22:00");
  const at = (iso: string) => ({
    switchedOn: true,
    closesAt,
    now: new Date(iso),
  });
  expect(isApplicationWindowOpen(at("2026-09-27T21:59:59+02:00"))).toBe(true);
  expect(isApplicationWindowOpen(at("2026-09-27T21:59:59.999+02:00"))).toBe(
    true,
  );
  expect(isApplicationWindowOpen(at("2026-09-27T22:00:00+02:00"))).toBe(false);
  expect(
    isApplicationWindowOpen({
      ...at("2026-09-27T21:00:00+02:00"),
      switchedOn: false,
    }),
  ).toBe(false);
});

test("E-Lab teaser status has a variant for each phase", () => {
  expect(eLabPhaseCopy.open.teaserStatus).toBe(
    `Applications open until ${eLabConfig.applicationDeadlineDate}`,
  );
  expect(eLabPhaseCopy.closed.teaserStatus).toBe(
    `Applications open in ${eLabConfig.nextApplicationWindow}`,
  );
});

test("E-Lab program length and proof points come from the config", () => {
  const weeks = `${eLabConfig.programWeeks}-week`;
  expect(eLabProgramSummary.startsWith(weeks)).toBe(true);
  const commitment = eLabFaq.find(
    (item) => item.question === "What is the time commitment for the program?",
  );
  expect(commitment?.answer).toContain(weeks);
});

test("E-Lab counts only the cohorts that have finished", () => {
  expect(Number.isInteger(eLabCompletedIterations)).toBe(true);
  expect(eLabCompletedIterations).toBeGreaterThan(0);
  // The current cohort is still running, so it is not among them.
  expect(Number.parseFloat(eLabConfig.currentIteration)).toBeGreaterThan(
    eLabCompletedIterations,
  );
  // Founders quoted as alumni of a cohort ("E-Lab 3.0") come from one of them.
  for (const card of testimonialCards) {
    const cohort = /^E-Lab (\d+)/.exec(card.context ?? "")?.[1];
    if (cohort) {
      expect(Number(cohort), card.name).toBeLessThanOrEqual(
        eLabCompletedIterations,
      );
    }
  }
  // The Q&A states the count it derives.
  const startups = qandaFaqs.find((entry) => entry.id === "startups");
  expect(startups?.evidence?.text).toContain(
    `has run ${eLabCompletedIterations} cohorts`,
  );
});

test("member figures add up and feed the partner stats", async () => {
  expect(officialMembers).toBe(
    organizationFacts.activeMembers + organizationFacts.alumni,
  );
  // The figures /partners renders from its code copy.
  const { stats } = await getPartnersCopy();
  const members = stats.find((stat) => stat.label === "Official members");
  expect(members?.value).toBe(`${officialMembers}+`);
});

test("the Apply FAQ timeline comes from the recruiting config", () => {
  const timeline = applyFaq.find(
    (item) => item.question === "What does the application timeline look like?",
  );
  for (const window of Object.values(recruitingTimeline)) {
    expect(timeline?.answer, window).toContain(window);
  }
});

/**
 * Facts that must be read from src/config/ instead of typed into pages. A
 * pattern with a capture group reports that group, not the whole match. If
 * this fails, import the value from the named config (see "Updating site
 * facts" in docs/contributor-guide.md) rather than silencing the pattern.
 */
const hardcodedFacts: [RegExp, string][] = [
  [/\b1\d-week\b|\bin 1\d weeks\b/i, "E-Lab length: config/e-lab.ts"],
  [
    /\b\d{3,}\+?\s+(?:team\s+)?applications\b/i,
    "E-Lab application count: eLabConfig.selection in config/e-lab.ts",
  ],
  [/\b\d+\+? active members\b/i, "member counts: config/organization.ts"],
  [
    /applications open in (january|february|march|april|may|june|july|august|september|october|november|december)/i,
    "application phase: config/e-lab.ts or config/membership.ts",
  ],
  [
    /\b(contact|partners|venture|recruitment)@tum-ai\.com\b/,
    "role emails: config/contact.ts",
  ],
  [
    /linkedin\.com\/company\/tum-ai|instagram\.com\/tum\.ai_official/,
    "social links: config/contact.ts",
  ],
  [/tally\.so\/r\//, "application forms: config/e-lab.ts or membership.ts"],
  [
    // A typed date range such as "September 24th - October 27th".
    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2}(?:[a-z]{2})? ?(?:-|to|until) ?(?:january|february|march|april|may|june|july|august|september|october|november|december|\d)/i,
    "recruiting round dates: membershipConfig.round in config/membership.ts",
  ],
  [
    // Anchored per line (`m`); the first group is the reported literal.
    /^.*?(https?:\/\/(?:www\.)?tum-ai\.com)(?![\w.-])/m,
    "site URL: absoluteUrl() or siteConfig.url from config/site.ts",
  ],
  [/\bVR ?\d+\b/, "register number: legalEntity in config/organization.ts"],
  [
    /\b210726\b/,
    "retired register number: legalEntity.registerNumber is the confirmed one",
  ],
  [
    /\binvoice@tum-ai\.com\b/,
    "invoice email: legalEntity in config/organization.ts",
  ],
  [
    // A figure next to "Makeathon" in the same sentence, either order.
    /makeathon\b[^.\n]*?(\b\d{3,}\+?\s+(?:registrations|participants|hackers|attendees|signups))|(\b\d{3,}\+?\s+(?:registrations|participants|hackers|attendees|signups)\b)[^.\n]*?\bmakeathon/i,
    "Makeathon size: config/community.ts",
  ],
  [
    /\b\d+\+?\s+(?:publications|papers)\b|\b\d{3,}\+?\s+hackers\b/i,
    "research output and hackathon reach: config/impact.ts",
  ],
  [
    /\b[a-z]+\.[a-z]+@tum-ai\.com\b/i,
    "personal emails: use a role address from config/contact.ts",
  ],
  [
    /\bcracked \d|\d+(?:\.\d+)?%[^\n]*\bacceptance rate\b|\bacceptance rate\b[^\n]*\d+(?:\.\d+)?%/i,
    "acceptance rate: organizationFacts in config/organization.ts",
  ],
  [
    /\b\d+k\+?\s+linkedin\b/i,
    "LinkedIn audience: organizationFacts in config/organization.ts",
  ],
];

/**
 * Known offenders outside W1-Data's ownership, each waiting for the stream
 * that owns the file. Keyed by file (relative to src/) and the pattern's
 * owner label. Remove an entry when its file is fixed: the second test fails
 * on entries that no longer match, so the list can only shrink.
 */
const allowlist: { file: string; fact: string; until: string }[] = [];

const srcDir = join(import.meta.dirname, "..", "src");
const exempt = [join(srcDir, "config")];

/** Colocated tests may spell facts out: they assert the rendered values. */
const isTestFile = (name: string) => /\.test\.tsx?$/.test(name);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (exempt.some((entry) => path.startsWith(entry))) return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !isTestFile(name) ? [path] : [];
  });
}

type Offence = { file: string; fact: string; match: string };

function findOffences(): Offence[] {
  return sourceFiles(srcDir).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    const file = relative(srcDir, path).split(sep).join("/");
    return hardcodedFacts.flatMap(([pattern, fact]) => {
      const match = source.match(pattern);
      return match ? [{ file, fact, match: match[1] ?? match[0] }] : [];
    });
  });
}

const isAllowed = (offence: Offence) =>
  allowlist.some(
    (entry) => entry.file === offence.file && entry.fact === offence.fact,
  );

test("pages read recurring facts from src/config instead of hardcoding them", () => {
  const offences = findOffences()
    .filter((offence) => !isAllowed(offence))
    .map(({ file, fact, match }) => `${file}: "${match}" (${fact})`);
  expect(offences).toStrictEqual([]);
});

test("every allowlisted offence still exists, so fixed files leave the list", () => {
  const offences = findOffences();
  const stale = allowlist.filter(
    (entry) =>
      !offences.some(
        (offence) => offence.file === entry.file && offence.fact === entry.fact,
      ),
  );
  expect(stale).toStrictEqual([]);
});
