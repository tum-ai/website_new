import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

import {
  eLabApplicationCopy,
  eLabConfig,
  eLabPhaseCopy,
  isELabApplicationOpen,
} from "@/config/e-lab";
import { parseMunichDateTime } from "@/lib/munich-time";
import { faq } from "./data/faq";
import {
  notableStartups,
  testimonialCards,
  tracedVenture,
} from "./data/venture-page";

// Editors change the deadline every round (docs/contributor-guide.md), so this
// checks its format and that the copy follows the config, not a fixed date.
test("E-Lab deadline is centralized and used by the FAQ", () => {
  const { applicationDeadlineDate: date, applicationDeadlineTime: time } =
    eLabConfig;
  expect(date).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  expect(time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
  expect(() => parseMunichDateTime(date, time)).not.toThrow();

  expect(eLabApplicationCopy.deadline).toBe(`${date} at ${time}`);
  expect(eLabApplicationCopy.deadlineLabel).toBe(
    `${date} at ${time} (Munich time)`,
  );

  const deadlineFaq = faq.find(
    (item) => item.question === "When is the application deadline?",
  );
  expect(deadlineFaq?.answer).toBe(
    `The application phase closes on ${date} at ${time} (Munich time).`,
  );
});

test("E-Lab applications are open until the deadline and closed from it", () => {
  const closesAt = parseMunichDateTime(
    eLabConfig.applicationDeadlineDate,
    eLabConfig.applicationDeadlineTime,
  ).getTime();
  // For 22:00: still open at 21:59:59 (unless switched off), closed at 22:00:00.
  expect(isELabApplicationOpen(new Date(closesAt - 1000))).toBe(
    eLabConfig.applicationsOpen,
  );
  expect(isELabApplicationOpen(new Date(closesAt))).toBe(false);

  expect(eLabPhaseCopy.open.roundStatus).toContain(
    eLabApplicationCopy.deadline,
  );
  expect(eLabPhaseCopy.closed.roundStatus).toContain(
    eLabConfig.nextApplicationWindow,
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

test("the traced venture and its founder quote exist", () => {
  expect(
    notableStartups.some((startup) => startup.id === tracedVenture.startupId),
  ).toBe(true);
  const founder = testimonialCards.find(
    (card) => card.id === tracedVenture.testimonialId,
  );
  expect(founder?.context).toBe(tracedVenture.cohort);
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
