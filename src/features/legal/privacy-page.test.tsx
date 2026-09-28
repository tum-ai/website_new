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

  test("has no axe violations", async () => {
    const { container } = render(<PrivacyPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
