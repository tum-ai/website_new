import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { contactEmails } from "@/config/contact";
import { legalEntity } from "@/config/organization";
import { getJsonLd } from "@/config/seo";
import { ImprintPage } from "./imprint-page";

/** The value (`dd`) next to a term (`dt`) of the organisation facts. */
function factValue(term: string) {
  const value = screen.getByText(term, { selector: "dt" }).nextElementSibling;
  if (value?.tagName !== "DD") throw new Error(`no value for ${term}`);
  return value;
}

describe("ImprintPage", () => {
  test("reads the association's legal facts from config", () => {
    render(<ImprintPage />);
    const { registeredOffice } = legalEntity;

    const organisation = screen.getByRole("region", { name: "Organisation" });
    expect(organisation).toHaveTextContent(legalEntity.legalName);
    expect(organisation).toHaveTextContent(
      `${registeredOffice.streetAddress}, ${registeredOffice.postalCode}`,
    );
    expect(factValue("Vereinsregisternummer")).toHaveTextContent(
      legalEntity.registerNumber,
    );
    for (const name of legalEntity.representatives) {
      expect(factValue("Vertreter")).toHaveTextContent(name);
    }
    expect(
      screen.getByRole("link", { name: contactEmails.general }),
    ).toHaveAttribute("href", `mailto:${contactEmails.general}`);
  });

  test("the route's Organization JSON-LD carries the same register number", () => {
    const [organization] = getJsonLd("imprint");
    expect(organization).toMatchObject({
      legalName: legalEntity.legalName,
      identifier: { value: legalEntity.registerNumber },
    });
  });

  test("has no axe violations", async () => {
    const { container } = render(<ImprintPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
