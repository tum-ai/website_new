import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { PartnerPillar } from "../data/partners";
import { PillarsSection } from "./pillars-section";

/** Reveal needs matchMedia and an IntersectionObserver; nothing intersects. */
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const pillar = (key: PartnerPillar["key"], title: string, href: string) => ({
  key,
  title,
  metric: "5+",
  metricLabel: "Figure",
  description: `What ${title} offers partners.`,
  image: {
    src: "/assets/homepage/IBM_visit.webp",
    width: 1920,
    height: 1440,
    alt: `${title} photo`,
  },
  href,
});

test("each pillar is a heading whose link names the pillar and leads to its page", async () => {
  const { container } = render(
    <PillarsSection
      pillars={[
        pillar("research", "Research", "/research"),
        pillar("venture", "Venture (E-Lab)", "/e-lab"),
      ]}
      copy={{ title: ["Three pillars."], lead: "One ecosystem." }}
    />,
  );
  const heading = screen.getByRole("heading", { level: 3, name: "Research" });
  const link = screen.getByRole("link", { name: "Research" });
  expect(heading).toContainElement(link);
  expect(link).toHaveAttribute("href", "/research");
  expect(screen.getByRole("link", { name: "Venture (E-Lab)" })).toHaveAttribute(
    "href",
    "/e-lab",
  );
  expect(await axe(container)).toHaveNoViolations();
});
