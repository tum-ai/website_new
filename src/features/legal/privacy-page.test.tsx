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

  test("fits the title's size without losing the display type token", () => {
    render(<PrivacyPage />);
    const title = screen.getByRole("heading", { level: 1 });
    // The display token carries weight, tracking and line height; the fit
    // class only caps the font size at a tenth of the column width, and
    // "Datenschutzerklärung" is about 9.7em wide.
    expect(title).toHaveClass("text-display-lg");
    expect(
      [...title.classList].filter((name) => name.startsWith("[font-size:")),
    ).toEqual([
      "[font-size:min(var(--text-display-lg),calc((100vw-2*var(--gutter))/10))]!",
    ]);
    expect([...title.classList].some((name) => name.startsWith("text-["))).toBe(
      false,
    );
  });

  test("has no axe violations", async () => {
    const { container } = render(<PrivacyPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
