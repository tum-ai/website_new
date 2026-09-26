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
import { membershipConfig } from "../src/config/membership.ts";
import {
  officialMembers,
  organizationFacts,
} from "../src/config/organization.ts";
import { faq as applyFaq } from "../src/features/apply/data/faq.ts";
import { faq as eLabFaq } from "../src/features/e-lab/data/faq.ts";
import { eLabMetrics } from "../src/features/e-lab/data/venture-page.ts";
import { partnerStats } from "../src/features/partners/data/partners.ts";
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

test("E-Lab applications close by themselves after the deadline minute", () => {
  const deadline = parseMunichDateTime(
    eLabConfig.applicationDeadlineDate,
    eLabConfig.applicationDeadlineTime,
  );
  expect(eLabApplicationsCloseAt.getTime()).toBe(deadline.getTime() + 60_000);

  const at = (offsetMs: number) => ({
    switchedOn: true,
    closesAt: eLabApplicationsCloseAt,
    now: new Date(deadline.getTime() + offsetMs),
  });
  expect(isApplicationWindowOpen(at(0))).toBe(true); // 23:59:00
  expect(isApplicationWindowOpen(at(59_999))).toBe(true); // 23:59:59.999
  expect(isApplicationWindowOpen(at(60_000))).toBe(false); // 00:00:00
  expect(isApplicationWindowOpen({ ...at(0), switchedOn: false })).toBe(false);
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

  const metric = (id: string) => eLabMetrics.find((item) => item.id === id);
  expect(metric("iterations")?.to).toBe(eLabCompletedIterations);
  expect(metric("funding")?.to).toBe(eLabConfig.ventureFundingMillions);
});

test("member figures add up and feed the partner stats", () => {
  expect(officialMembers).toBe(
    organizationFacts.activeMembers + organizationFacts.alumni,
  );
  const members = partnerStats.find(
    (stat) => stat.label === "Official members",
  );
  expect(members?.value).toBe(`${officialMembers}+`);
});

test("the Apply FAQ timeline comes from the recruiting config", () => {
  const timeline = applyFaq.find(
    (item) => item.question === "How does the application timeline look like?",
  );
  for (const window of Object.values(membershipConfig.timeline)) {
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
    // Anchored per line (`m`); the first group is the reported literal.
    /^.*?(https?:\/\/(?:www\.)?tum-ai\.com)(?![\w.-])/m,
    "site URL: absoluteUrl() or siteConfig.url from config/site.ts",
  ],
  [/\bVR ?\d{5,6}\b/, "register number: config/organization.ts"],
  [
    /\b[a-z]+\.[a-z]+@tum-ai\.com\b/i,
    "personal emails: use a role address from config/contact.ts",
  ],
];

/**
 * Known offenders outside W1-Data's ownership, each waiting for the stream
 * that owns the file. Keyed by file (relative to src/) and the pattern's
 * owner label. Remove an entry when its file is fixed: the second test fails
 * on entries that no longer match, so the list can only shrink.
 */
const allowlist: { file: string; fact: string; until: string }[] = [
  {
    file: "app/(site)/layout.tsx",
    fact: "site URL: absoluteUrl() or siteConfig.url from config/site.ts",
    until: "the layout reads `rootMetadata` from config/seo.ts",
  },
  {
    file: "features/e-lab/e-lab-page.tsx",
    fact: "site URL: absoluteUrl() or siteConfig.url from config/site.ts",
    until: "W2 E-Lab builds its JSON-LD URLs with absoluteUrl()",
  },
  {
    file: "features/legal/privacy-page.tsx",
    fact: "site URL: absoluteUrl() or siteConfig.url from config/site.ts",
    until: "W2 Legal renders the site links from config/site.ts",
  },
  {
    file: "features/legal/imprint-page.tsx",
    fact: "register number: config/organization.ts",
    until:
      "Justin confirms the register number (TODO(content) in config/organization.ts)",
  },
  {
    file: "features/partners/partnerships.ts",
    fact: "personal emails: use a role address from config/contact.ts",
    until: "W2 Partners routes partner mail through a role address",
  },
];

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
