import { expect, test } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { officialMembers } from "@/config/organization";
import { rexInstitutions } from "@/features/research";
import { fillCodeCopy } from "@/lib/content-copy";
import { homeCopyTemplate, homePageTokens } from "./data/homepage";
import { homeView } from "./home-view";

const copy = fillCodeCopy(homeCopyTemplate, contentTokens, homePageTokens);

test("the ledger takes its labels from the copy and its figures from the config", () => {
  const { ledger } = homeView(copy, 7);
  expect(ledger.map(({ label }) => label)).toStrictEqual(
    homeCopyTemplate.ledger.map(({ label }) => label),
  );
  expect(ledger.find(({ label }) => label === "Members")).toMatchObject({
    value: officialMembers,
    suffix: "+",
  });
});

test("the programs name the REX institutions and count the departments", () => {
  const { programs } = homeView(copy, 7);
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
