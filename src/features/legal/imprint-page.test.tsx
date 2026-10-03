import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { legalEntity } from "@/config/organization";
import { getJsonLd } from "@/config/seo";
import { ImprintPage } from "./imprint-page";

const generalEmail = "legal-contact@example.com";

vi.mock("@/config/site-settings-content", () => ({
  getSiteFacts: vi.fn(async () => ({
    contactEmails: {
      general: generalEmail,
      partners: "partners@example.com",
      venture: "venture@example.com",
      recruitment: "join@example.com",
    },
    organization: { foundingYear: 2024 },
    socialLinks: {
      linkedin: "https://example.com/linkedin",
      instagram: "https://example.com/instagram",
      facebook: "https://example.com/facebook",
      x: "https://example.com/x",
      youtube: "https://example.com/youtube",
      github: "https://example.com/github",
      tiktok: "https://example.com/tiktok",
    },
  })),
}));

/** The value (`dd`) next to a term (`dt`) of the organisation facts. */
function factValue(term: string) {
  const value = screen.getByText(term, { selector: "dt" }).nextElementSibling;
  if (value?.tagName !== "DD") throw new Error(`no value for ${term}`);
  return value;
}

describe("ImprintPage", () => {
  test("reads legal facts from config and the general mailbox from CMS settings", async () => {
    render(await ImprintPage());
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
    expect(screen.getByRole("link", { name: generalEmail })).toHaveAttribute(
      "href",
      `mailto:${generalEmail}`,
    );
  });

  test("the route's Organization JSON-LD carries the same register number", async () => {
    const [organization] = await getJsonLd("imprint");
    expect(organization).toMatchObject({
      legalName: legalEntity.legalName,
      email: generalEmail,
      identifier: { value: legalEntity.registerNumber },
    });
  });

  test("has no axe violations", async () => {
    const { container } = render(await ImprintPage());
    expect(await axe(container)).toHaveNoViolations();
  });
});
