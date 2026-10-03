import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { callToActionLabels } from "@/config/calls-to-action";
import {
  connectLinksFor,
  contributeLinksFor,
  legalLinks,
  mainNavigation,
} from "@/config/navigation";
import { getSiteFacts } from "@/config/site-settings-content";
import { settingsFixtureFacts as siteFactsFallback } from "@/lib/cms-fixtures/settings";
import { Footer } from "./footer";

vi.mock("@/config/site-settings-content", () => ({ getSiteFacts: vi.fn() }));

const facts = {
  ...siteFactsFallback,
  footerTagline: "Our current community tagline",
  contactEmails: {
    ...siteFactsFallback.contactEmails,
    general: "footer@example.com",
  },
  socialLinks: {
    ...siteFactsFallback.socialLinks,
    linkedin: "https://www.linkedin.com/company/footer-community",
    github: "https://github.com/footer-community",
  },
};

beforeEach(() => {
  vi.mocked(getSiteFacts).mockResolvedValue(facts);
});

describe("website footer adapter", () => {
  test("renders server facts, existing branding, actions and bottom line", async () => {
    const { container } = render(await Footer());
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText(facts.footerTagline)).toBeVisible();
    expect(within(footer).getByRole("img", { name: "TUM.ai" })).toHaveAttribute(
      "src",
      "/assets/tum_ai_logo_new.svg",
    );
    expect(
      within(footer).getByRole("link", { name: callToActionLabels.member }),
    ).toHaveAttribute("href", "/apply");
    expect(
      within(footer).getByRole("link", { name: "Partner with us" }),
    ).toHaveAttribute("href", "/partners");
    expect(
      within(footer).getByText(
        "TUM.ai - Student Initiative at Technical University of Munich",
      ),
    ).toBeVisible();
    expect(within(footer).getByText("Munich, Germany")).toBeVisible();
    expect(footer.querySelector("[data-footer-mark]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  test("supplies all navigation groups with stable accessible IDs and CMS links", async () => {
    render(await Footer());
    const nav = within(screen.getByRole("contentinfo")).getByRole(
      "navigation",
      {
        name: "Footer",
      },
    );
    const columns = [
      { id: "explore", title: "Explore", links: mainNavigation },
      { id: "connect", title: "Connect", links: connectLinksFor(facts) },
      { id: "legal", title: "Legal", links: legalLinks },
      {
        id: "contribute",
        title: "Contribute",
        links: contributeLinksFor(facts),
      },
    ];
    for (const { id, title, links } of columns) {
      const list = within(nav).getByRole("list", { name: title });
      expect(list).toHaveAttribute("aria-labelledby", `footer-${id}`);
      expect(within(list).getAllByRole("link")).toHaveLength(links.length);
      for (const { href, label } of links) {
        const external = href.startsWith("https://");
        const link = within(list).getByRole("link", {
          name: external ? `${label}(opens in a new tab)` : label,
        });
        expect(link).toHaveAttribute("href", href);
        expect(link.getAttribute("target")).toBe(external ? "_blank" : null);
      }
    }
  });
});
