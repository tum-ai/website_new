import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

import {
  eLabApplicationCopy,
  eLabCompletedIterations,
  eLabConfig,
  eLabProgramSummary,
  getELabTeaserStatus,
} from "../src/config/e-lab.ts";
import { membershipConfig } from "../src/config/membership.ts";
import {
  officialMembers,
  organizationFacts,
} from "../src/config/organization.ts";
import { faq as applyFaq } from "../src/data/apply/faq.tsx";
import { faq as eLabFaq } from "../src/data/e-lab/FAQ.tsx";
import { eLabMetrics } from "../src/data/e-lab/venture-page.ts";
import { partnerStats } from "../src/data/partners.ts";

test("E-Lab teaser status follows the application phase", () => {
  const phase = {
    applicationDeadlineDate: "26.09.2026",
    nextApplicationWindow: "August",
  };
  assert.equal(
    getELabTeaserStatus({ ...phase, applicationsOpen: true }),
    "Applications open until 26.09.2026",
  );
  assert.equal(
    getELabTeaserStatus({ ...phase, applicationsOpen: false }),
    "Applications open in August",
  );
  assert.equal(
    eLabApplicationCopy.teaserStatus,
    getELabTeaserStatus(eLabConfig),
  );
});

test("E-Lab program length and proof points come from the config", () => {
  const weeks = `${eLabConfig.programWeeks}-week`;
  assert.ok(eLabProgramSummary.startsWith(weeks));
  const commitment = eLabFaq.find(
    (item) => item.question === "What is the time commitment for the program?",
  );
  assert.ok(commitment?.answer.includes(weeks));

  const metric = (id: string) => eLabMetrics.find((item) => item.id === id);
  assert.equal(metric("iterations")?.to, eLabCompletedIterations);
  assert.equal(metric("funding")?.to, eLabConfig.ventureFundingMillions);
});

test("member figures add up and feed the partner stats", () => {
  assert.equal(
    officialMembers,
    organizationFacts.activeMembers + organizationFacts.alumni,
  );
  const members = partnerStats.find(
    (stat) => stat.label === "Official members",
  );
  assert.equal(members?.value, `${officialMembers}+`);
});

test("the Apply FAQ timeline comes from the recruiting config", () => {
  const timeline = applyFaq.find(
    (item) => item.question === "How does the application timeline look like?",
  );
  for (const window of Object.values(membershipConfig.timeline)) {
    assert.ok(timeline?.answer.includes(window), window);
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

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (exempt.some((entry) => path.startsWith(entry))) return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
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
  assert.deepEqual(offences, []);
});
