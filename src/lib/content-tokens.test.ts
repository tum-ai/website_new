import { describe, expect, test } from "vitest";
import {
  type ContentTokens,
  contentTokenNames,
  fillCodeTemplate,
  fillTemplate,
  templateTokenNames,
  unknownTokenNames,
} from "./content-tokens";

const tokens = Object.fromEntries(
  contentTokenNames.map((name) => [name, `<${name}>`]),
) as ContentTokens;

describe("content tokens", () => {
  test("lists the placeholders a template uses, known or not", () => {
    const template = "Opens {{recruiting.application}}, mail {{ nope }}.";
    expect(templateTokenNames(template)).toStrictEqual([
      "recruiting.application",
      "nope",
    ]);
    expect(unknownTokenNames(template)).toStrictEqual(["nope"]);
  });

  test("fills every known placeholder, spaces inside the braces allowed", () => {
    expect(
      fillTemplate(
        "Closes {{eLab.deadline}} ({{ eLab.programWeeks }})",
        tokens,
      ),
    ).toBe("Closes <eLab.deadline> (<eLab.programWeeks>)");
    expect(fillTemplate("No placeholders", tokens)).toBe("No placeholders");
  });

  test("CMS text with an unknown placeholder yields null", () => {
    expect(fillTemplate("Hi {{eLab.dedline}}", tokens)).toBeNull();
  });

  test("code templates with an unknown placeholder throw", () => {
    expect(fillCodeTemplate("{{eLab.deadline}}", tokens)).toBe(
      "<eLab.deadline>",
    );
    expect(() => fillCodeTemplate("{{eLab.dedline}}", tokens)).toThrow(
      /eLab\.dedline/,
    );
  });
});
