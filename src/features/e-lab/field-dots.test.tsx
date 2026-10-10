import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
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
      name: "Example Venture",
      href: "https://example.org/venture",
      logoSrc: "/assets/fixtures/logo.svg",
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
      name: "Example Venture, an E-Lab venture (opens in a new tab)",
    });
    expect(link).toHaveAttribute("href", "https://example.org/venture");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("a tap opens a venture's dot and only the next tap follows its link", () => {
    // jsdom has no SVG geometry: map client coordinates 1:1 to the viewBox.
    vi.stubGlobal(
      "DOMPoint",
      class {
        constructor(
          readonly x: number,
          readonly y: number,
        ) {}
        matrixTransform() {
          return this;
        }
      },
    );
    const { container } = render(
      <FieldDots dots={dots} viewBox="-1 -1 3 3" radius={0.3} />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    svg.getScreenCTM = () => ({ inverse: () => ({}) }) as unknown as DOMMatrix;
    const link = screen.getByRole("link");
    const tap = () => {
      fireEvent.pointerDown(svg, {
        clientX: 0.5,
        clientY: 0.866,
        pointerType: "touch",
      });
      return fireEvent.click(link);
    };

    expect(tap()).toBe(false);
    expect(link).toHaveAttribute("data-expanded", "true");
    expect(tap()).toBe(true);
  });

  test("a venture without a site still opens, but as a logo, not a link", async () => {
    vi.stubGlobal(
      "DOMPoint",
      class {
        constructor(
          readonly x: number,
          readonly y: number,
        ) {}
        matrixTransform() {
          return this;
        }
      },
    );
    const unlinked: FieldDotData[] = [
      { x: 0, y: 0, delay: 700 },
      {
        x: 1,
        y: 0,
        venture: {
          name: "Example Venture",
          logoSrc: "/assets/fixtures/logo.svg",
        },
      },
    ];
    const { container } = render(
      <FieldDots dots={unlinked} viewBox="-1 -1 3 3" radius={0.3} />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    svg.getScreenCTM = () => ({ inverse: () => ({}) }) as unknown as DOMMatrix;
    expect(container.querySelector("a")).toBeNull();
    const logo = container.querySelector(
      'image[href="/assets/fixtures/logo.svg"]',
    )?.parentElement;
    expect(logo).toHaveAttribute("data-expanded", "false");
    fireEvent.pointerMove(svg, { clientX: 1, clientY: 0 });
    expect(logo).toHaveAttribute("data-expanded", "true");
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
