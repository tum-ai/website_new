import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { eLabApplicationCopy, eLabConfig } from "../src/config/e-lab.ts";
import { faq } from "../src/data/e-lab/FAQ.tsx";
import {
  eLabMetrics,
  notableStartups,
  programSteps,
  testimonialCards,
} from "../src/data/e-lab/venture-page.ts";

const expectedTimeline = [
  [
    "Kickoff & Onboarding Weekend",
    "3 Days Intensive • Team Alignment & Ideation",
  ],
  [
    "Phase I: MVP Build & Foundational Sessions",
    "4 Weeks • Rapid Prototyping, Problem-Fit & Core Tech",
  ],
  ["Midterm Pitch (MVP Gate)", "Live MVP Demo & Jury Feedback"],
  [
    "Phase II: Traction, Iteration & Growth Sessions",
    "6 Weeks • User Testing, Go-to-Market, Legal & Pitch Polish",
  ],
  ["Selection Day", "Evaluation for Final Showcase"],
  ["Final Pitch / Demo Day", "Investor Pitch & Graduation (July)"],
];

test("E-Lab metrics match the approved proof points", () => {
  assert.deepEqual(
    eLabMetrics.map(({ label, to, prefix = "", suffix = "" }) => [
      prefix + to + suffix,
      label,
    ]),
    [
      ["~500", "applications per batch"],
      ["€7M+", "raised by E-Lab ventures"],
      ["5", "E-Lab Iterations"],
    ],
  );
});

test("E-Lab deadline is centralized and used by the FAQ", () => {
  assert.equal(eLabConfig.applicationDeadline, "26.09.2026 at 23:59");
  assert.equal(eLabApplicationCopy.deadline, eLabConfig.applicationDeadline);

  const deadlineFaq = faq.find(
    (item) => item.question === "When is the application deadline?",
  );
  assert.equal(
    deadlineFaq?.answer,
    "The application phase closes on 26.09.2026 at 23:59.",
  );
});

test("E-Lab testimonials include the requested people and exact quotes", () => {
  const axel = testimonialCards.find((card) => card.id === "axel-taeubert");
  assert.deepEqual(axel && [axel.name, axel.role, axel.quote], [
    "Axel Täubert",
    "Head of Startups @ Google Cloud",
    "Truly impressive what the team has built. 🚀 We’re just getting started",
  ]);

  const alexandra = testimonialCards.find(
    (card) => card.id === "alexandra-reinert",
  );
  assert.deepEqual(
    alexandra && [alexandra.name, alexandra.role, alexandra.quote],
    [
      "Alexandra Reinert",
      "Partner @ Accel",
      "The density of real builders at the E-Lab Final Pitch is exactly what Tier-1 venture funds look for at the pre-seed stage",
    ],
  );
});

test("E-Lab program timeline is the approved six-step journey", () => {
  assert.deepEqual(
    programSteps.map(({ title, description }) => [title, description]),
    expectedTimeline,
  );
});

test("E-Lab startup list includes Invertix and the revised workshop copy", () => {
  assert.deepEqual(
    notableStartups.find((startup) => startup.id === "invertix"),
    {
      id: "invertix",
      name: "Invertix",
      href: "https://www.invertix.ai/",
      logoSrc: "/assets/e-lab/startups/invertix.webp",
      logoAlt: "Invertix logo",
      wordmarkLabel: "Invertix",
    },
  );

  const commitmentFaq = faq.find((item) =>
    item.question.startsWith("Can I apply if I’m still a student"),
  );
  assert.match(
    commitmentFaq?.answer ?? "",
    /attend the workshops, and engage with mentors\./,
  );
});

test("Every E-Lab content image references an existing local asset", () => {
  const referencedAssets = new Set([
    ...testimonialCards.flatMap((card) => [
      card.portraitSrc,
      card.organizationLogoSrc,
    ]),
    ...notableStartups.map((startup) => startup.logoSrc),
  ]);

  for (const asset of referencedAssets) {
    assert.equal(
      existsSync(join(process.cwd(), "public", asset.slice(1))),
      true,
      "Missing local E-Lab asset: " + asset,
    );
  }
});
