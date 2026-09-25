import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
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
import { faq as applyFaq } from "../src/data/apply/faq.tsx";
import { faq as eLabFaq } from "../src/data/e-lab/FAQ.tsx";
import { eLabMetrics } from "../src/data/e-lab/venture-page.ts";
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
 * Facts that must be read from src/config/ instead of typed into pages. If
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
];

const srcDir = join(import.meta.dirname, "..", "src");
const exempt = [join(srcDir, "config"), join(srcDir, "lib", "mock-cms.ts")];

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

test("pages read recurring facts from src/config instead of hardcoding them", () => {
  const offences: string[] = [];
  for (const file of sourceFiles(srcDir)) {
    const source = readFileSync(file, "utf8");
    for (const [pattern, owner] of hardcodedFacts) {
      const match = source.match(pattern);
      if (match) {
        offences.push(`${relative(srcDir, file)}: "${match[0]}" (${owner})`);
      }
    }
  }
  expect(offences).toStrictEqual([]);
});
