import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { QuoteCard } from "./quote-card";

describe("QuoteCard", () => {
  test.each(["raised", "glass", "editorial", "ruled"] as const)(
    "%s: a figure with the quotation and who said it",
    async (variant) => {
      const { container } = render(
        <QuoteCard
          variant={variant}
          quote="Build it here."
          name="Ada Lovelace"
          byline="Founder"
          portrait={{ src: "/assets/home_img4.webp" }}
          logo={{ src: "/assets/favicon.svg", alt: "TUM.ai" }}
        />,
      );
      const figure = screen.getByRole("figure");
      expect(figure).toHaveTextContent("Build it here.");
      expect(figure).toHaveTextContent("Ada Lovelace");
      expect(screen.getByText("Build it here.").closest("blockquote")).not.toBe(
        null,
      );
      // The portrait is decorative: the caption already names the person.
      expect(screen.getByRole("img", { name: "TUM.ai" })).toBeInTheDocument();
      expect(screen.getAllByRole("img")).toHaveLength(1);
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
