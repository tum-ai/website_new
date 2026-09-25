import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

import { eLabApplicationCopy, eLabConfig } from "@/config/e-lab";
import { parseMunichDateTime } from "@/lib/munich-time";
import { faq } from "./data/faq";
import {
  eLabMetrics,
  notableStartups,
  programSteps,
  testimonialCards,
} from "./data/venture-page";

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
  expect(
    eLabMetrics.map(({ label, to, prefix = "", suffix = "" }) => [
      prefix + to + suffix,
      label,
    ]),
  ).toStrictEqual([
    ["~500", "applications per batch"],
    ["€8M", "raised by E-Lab ventures"],
    ["5", "E-Lab Iterations"],
  ]);
});

// Editors change the deadline every round (docs/contributor-guide.md), so this
// checks its format and that the copy follows the config, not a fixed date.
test("E-Lab deadline is centralized and used by the FAQ", () => {
  const { applicationDeadlineDate: date, applicationDeadlineTime: time } =
    eLabConfig;
  expect(date).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  expect(time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
  expect(() => parseMunichDateTime(date, time)).not.toThrow();

  expect(eLabApplicationCopy.deadline).toBe(`${date} at ${time}`);

  const deadlineFaq = faq.find(
    (item) => item.question === "When is the application deadline?",
  );
  expect(deadlineFaq?.answer).toBe(
    `The application phase closes on ${date} at ${time}.`,
  );
});

test("E-Lab testimonials include the requested people and exact quotes", () => {
  const axel = testimonialCards.find((card) => card.id === "axel-taeubert");
  expect(axel && [axel.name, axel.role, axel.quote]).toStrictEqual([
    "Axel Täubert",
    "Head of Startups @ Google Cloud",
    "Truly impressive what the team has built. 🚀 We’re just getting started",
  ]);

  const alexandra = testimonialCards.find(
    (card) => card.id === "alexandra-reinert",
  );
  expect(
    alexandra && [alexandra.name, alexandra.role, alexandra.quote],
  ).toStrictEqual([
    "Alexandra Reinert",
    "Partner @ Accel",
    "The density of real builders at the E-Lab Final Pitch is exactly what Tier-1 venture funds look for at the pre-seed stage",
  ]);
});

test("E-Lab program timeline is the approved six-step journey", () => {
  expect(
    programSteps.map(({ title, description }) => [title, description]),
  ).toStrictEqual(expectedTimeline);
});

test("E-Lab startup list includes Invertix and the revised workshop copy", () => {
  expect(
    notableStartups.find((startup) => startup.id === "invertix"),
  ).toStrictEqual({
    id: "invertix",
    name: "Invertix",
    href: "https://www.invertix.ai/",
    logoSrc: "/assets/e-lab/startups/invertix.webp",
    logoAlt: "Invertix logo",
    wordmarkLabel: "Invertix",
  });

  const commitmentFaq = faq.find((item) =>
    item.question.startsWith("Can I apply if I’m still a student"),
  );
  expect(commitmentFaq?.answer ?? "").toMatch(
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
    expect(
      existsSync(join(process.cwd(), "public", asset.slice(1))),
      `Missing local E-Lab asset: ${asset}`,
    ).toBe(true);
  }
});
