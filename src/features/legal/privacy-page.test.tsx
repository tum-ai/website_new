import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { legalEntity, registeredOfficeLinesDe } from "@/config/organization";
import { absoluteUrl } from "@/config/site";
import { PrivacyPage } from "./privacy-page";

describe("PrivacyPage", () => {
  test("reads the controller's address and mailbox from config", () => {
    render(<PrivacyPage />);
    const controller = screen.getByRole("region", {
      name: /Name und Kontaktdaten/,
    });
    for (const line of registeredOfficeLinesDe) {
      expect(controller).toHaveTextContent(line);
    }
    for (const link of screen.getAllByRole("link", {
      name: legalEntity.invoiceEmail,
    })) {
      expect(link).toHaveAttribute(
        "href",
        `mailto:${legalEntity.invoiceEmail}`,
      );
    }
  });

  test("links the site's own pages on the canonical origin", () => {
    render(<PrivacyPage />);
    for (const path of ["/", "/apply", "/data-privacy"]) {
      const url = absoluteUrl(path);
      expect(screen.getByRole("link", { name: url })).toHaveAttribute(
        "href",
        url,
      );
    }
  });

  test("sets the title in the fitting display size", () => {
    render(<PrivacyPage />);
    // "Datenschutzerklärung" is about 9.7em wide: the fit size caps the
    // display type at a tenth of the column, so the word never overflows.
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "text-display-fit",
    );
  });

  test("has no axe violations", async () => {
    const { container } = render(<PrivacyPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
