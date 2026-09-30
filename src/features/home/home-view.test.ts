import { expect, test } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { officialMembers } from "@/config/organization";
import { siteFactsFallback } from "@/config/site-facts";
import { getRexInstitutions } from "@/features/research/server";
import { fillCodeCopy } from "@/lib/content-copy";
import { homeCopyTemplate, homePageTokens } from "./data/homepage";
import { homeView } from "./home-view";

const copy = fillCodeCopy(homeCopyTemplate, contentTokens, homePageTokens);
const rexInstitutions = await getRexInstitutions();
const sources = {
  facts: siteFactsFallback,
  departmentCount: 7,
  rexInstitutions,
};

test("the ledger takes its labels from the copy and its figures from the facts", () => {
  const { ledger } = homeView(copy, sources);
  expect(ledger.map(({ label }) => label)).toStrictEqual(
    homeCopyTemplate.ledger.map(({ label }) => label),
  );
  expect(ledger.find(({ label }) => label === "Members")).toMatchObject({
    value: officialMembers,
    suffix: "+",
  });
});

test("the programs name the REX institutions and count the departments", () => {
  const { programs } = homeView(copy, sources);
  const text = programs.map(({ description }) => String(description)).join(" ");
  expect(text).toContain("seven departments");
  for (const { shortName } of rexInstitutions)
    expect(text).toContain(shortName);
  expect(text).not.toMatch(/\{\{/);
  expect(
    programs.find(({ id }) => id === "entrepreneurship")?.image,
  ).toStrictEqual({
    src: "/assets/homepage/elab.webp",
    position: "50% 40%",
  });
});

test("the ledger follows edited facts", () => {
  const facts = {
    ...siteFactsFallback,
    organization: { ...siteFactsFallback.organization, nationalities: 99 },
  };
  const { ledger } = homeView(copy, { ...sources, facts });
  expect(ledger).toContainEqual(
    expect.objectContaining({ value: 99, suffix: "+" }),
  );
});

test("the funding figure keeps the fact's decimals", () => {
  const withFunding = (ventureFundingMillions: number) =>
    homeView(copy, {
      ...sources,
      facts: {
        ...siteFactsFallback,
        eLab: { ...siteFactsFallback.eLab, ventureFundingMillions },
      },
    }).ledger.find(({ value }) => value === ventureFundingMillions);
  expect(withFunding(7.5)).toMatchObject({ prefix: "€", decimals: 1 });
  expect(withFunding(12)).toMatchObject({ prefix: "€", decimals: 0 });
});
