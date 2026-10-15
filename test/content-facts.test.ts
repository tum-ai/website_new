import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { beforeEach, expect, test, vi } from "vitest";
import { getContentTokens } from "@/config/content-tokens";
import {
  eLabCompletedIterationsOf,
  eLabPhaseCopyOf,
  eLabProgramSummaryOf,
  eLabWindowClock,
  isApplicationWindowOpen,
} from "@/config/e-lab";
import { recruitingTimelineOf, roundSchedule } from "@/config/membership";
import { officialMembersOf } from "@/config/organization";
import { getSiteFacts } from "@/config/site-settings-content";
import {
  settingsFixtureELabWindow,
  settingsFixtureFacts,
  settingsFixtureMembership,
} from "@/lib/cms-fixtures/settings";
import { parseMunichDateTime } from "@/lib/munich-time";

beforeEach(() => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
});
test("Munich wall-clock deadlines resolve summer and winter offsets", () => {
  expect(parseMunichDateTime("26.09.2026", "23:59").toISOString()).toBe(
    "2026-09-26T21:59:00.000Z",
  );
  expect(parseMunichDateTime("15.01.2027", "12:00").toISOString()).toBe(
    "2027-01-15T11:00:00.000Z",
  );
  expect(() => parseMunichDateTime("2026-09-26", "23:59")).toThrow();
});
test("CMS application deadlines close at the exact Munich instant", () => {
  const clock = eLabWindowClock(settingsFixtureELabWindow);
  const closesAt = new Date(clock.closesAt as number);
  const at = (offset: number) => ({
    switchedOn: true,
    closesAt,
    now: new Date(closesAt.getTime() + offset),
  });
  expect(isApplicationWindowOpen(at(-1))).toBe(true);
  expect(isApplicationWindowOpen(at(0))).toBe(false);
  expect(isApplicationWindowOpen({ ...at(-1), switchedOn: false })).toBe(false);
});
test("phase and program wording derive from supplied CMS facts", () => {
  const phase = eLabPhaseCopyOf(
    settingsFixtureFacts.eLab.currentIteration,
    settingsFixtureELabWindow,
  );
  expect(phase.open.teaserStatus).toContain(
    settingsFixtureELabWindow.applicationDeadlineDate,
  );
  expect(phase.closed.teaserStatus).toContain(
    settingsFixtureELabWindow.nextApplicationWindow,
  );
  expect(eLabProgramSummaryOf(8)).toBe(
    "8-week equity-free AI startup incubator",
  );
  expect(eLabCompletedIterationsOf("3.0")).toBe(2);
});
test("CMS member totals and content tokens follow edited published facts", async () => {
  const facts = await getSiteFacts();
  expect(officialMembersOf(facts.organization)).toBe(
    facts.organization.activeMembers + facts.organization.alumni,
  );
  const tokens = await getContentTokens();
  expect(tokens["org.officialMembers"]).toBe(
    String(officialMembersOf(facts.organization)),
  );
  expect(tokens["org.startedApplications"]).toBe(
    String(facts.organization.startedApplicationsPerBatch),
  );
});
test("recruiting timeline derives its date labels from the CMS round", () => {
  const timeline = recruitingTimelineOf(
    roundSchedule(settingsFixtureMembership.round),
  );
  expect(Object.values(timeline).join(" ")).toContain("October");
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
    /\b\d{3,}\+?\s+started applications\b|\b\d+(?:\.\d+)?%\s+(?:acceptance|accepted|get in)\b/i,
    "recruiting selection: organizationFacts in config/organization.ts",
  ],
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
    /\behl\.gg\b|\bmakeathon\.tum-ai\.com\b/i,
    "hackathon sites: config/hackathons.ts",
  ],
  [
    // The league's cities or their count, typed into copy next to its name
    // (an event's own title, "European Hackathon League: Paris", is data).
    /hackathon league\b[^.\n]*?\b\d+ cities\b|hackathon league\b[^.\n:]*?\b(?:Berlin|Paris|Zurich)\b/i,
    "league cities: hackathonFacts.league in config/hackathons.ts",
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
