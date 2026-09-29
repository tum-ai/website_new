import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { type FieldDotData, FieldDots } from "./field-dots";

const dots: FieldDotData[] = [
  { x: 0, y: 0, delay: 700 },
  { x: 1, y: 0, delay: 900 },
  {
    x: 0.5,
    y: 0.866,
    venture: {
      name: "Spherecast",
      href: "https://www.spherecast.ai/",
      logoSrc: "/assets/e-lab/startups/Spherecast.webp",
    },
  },
];

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({ matches: true, media: query }) as unknown as MediaQueryList,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FieldDots", () => {
  test("each venture dot is a link that names the venture and its new tab", async () => {
    const { container } = render(
      <FieldDots dots={dots} viewBox="-1 -1 3 3" radius={0.3} />,
    );
    const link = screen.getByRole("link", {
      name: "Spherecast, an E-Lab venture (opens in a new tab)",
    });
    expect(link).toHaveAttribute("href", "https://www.spherecast.ai/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("the field is named without a hover tooltip", () => {
    const { container } = render(
      <FieldDots dots={dots} viewBox="-1 -1 3 3" radius={0.3} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAccessibleName(/team applications/);
    expect(svg?.querySelector("title")).toBeNull();
  });

  test("keyboard focus opens the venture as hover does, and blur closes it", async () => {
    const user = userEvent.setup();
    render(<FieldDots dots={dots} viewBox="-1 -1 3 3" radius={0.3} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("data-expanded", "false");
    await user.tab();
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("data-expanded", "true");
    await user.tab();
    expect(link).toHaveAttribute("data-expanded", "false");
  });
});
