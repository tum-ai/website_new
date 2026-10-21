import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  FADE_BATCH_MS,
  type FieldDotData,
  FieldDots,
  fadeBatches,
} from "./field-dots";

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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("FieldDots", () => {
  test("each venture dot is a link that names the venture and its new tab", async () => {
    const { container } = render(
      <FieldDots dots={dots} viewBox="-1 -1 3 3" radius={0.3} />,
    );
    const link = screen.getByRole("link", {
      name: "Example Venture, an ELAB venture (opens in a new tab)",
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
    const logo = container.querySelector("g[data-expanded]");
    expect(logo).toHaveAttribute("data-expanded", "false");
    fireEvent.pointerMove(svg, { clientX: 1, clientY: 0 });
    expect(logo).toHaveAttribute("data-expanded", "true");
    expect(
      logo?.querySelector('image[href="/assets/fixtures/logo.svg"]'),
    ).not.toBeNull();
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

describe("FieldDots load fade", () => {
  const field: FieldDotData[] = [
    { x: 0, y: 0, delay: 700 },
    { x: 1, y: 0, delay: 750 },
    { x: 2, y: 0, delay: 700 + FADE_BATCH_MS },
    { x: 3, y: 0, delay: 5000 },
    { x: 4, y: 0 },
  ];

  test("batches the dots that go out by start time, one path each", () => {
    const batches = fadeBatches(field, 0.3);
    expect(batches.map((batch) => batch.delay)).toEqual([700, 900, 5000]);
    // Two circles (two arcs each) in the first batch, one in the others.
    expect(batches[0]?.d.match(/M/g)).toHaveLength(2);
    expect(batches[1]?.d.match(/M/g)).toHaveLength(1);
  });

  test("draws one animated path per batch and the lit dots as circles until the first interaction", () => {
    const { container } = render(
      <FieldDots dots={field} viewBox="-1 -1 6 3" radius={0.3} />,
    );
    const paths = container.querySelectorAll("path.elab-field-out");
    expect(paths).toHaveLength(3);
    expect(paths[0]).toHaveStyle({ "--delay": "700ms" });
    expect(container.querySelectorAll("circle")).toHaveLength(1);
    expect(container.querySelector("image")).toBeNull();
  });

  test("goes live on the first pointer: one circle per dot, done fades dimmed, running ones carried on", () => {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({ matches: false, media: query }) as unknown as MediaQueryList,
    );
    vi.spyOn(performance, "now").mockReturnValue(2000);
    const { container } = render(
      <FieldDots dots={field} viewBox="-1 -1 6 3" radius={0.3} />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    svg.getScreenCTM = () => null;
    fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });

    expect(container.querySelectorAll("path.elab-field-out")).toHaveLength(0);
    const circles = [...container.querySelectorAll("g[fill] > circle")];
    expect(circles).toHaveLength(field.length);
    // At 2000 ms the 700/750 ms fades (1.2 s long) are over, the 900 ms one
    // runs on from 1100 ms in, and the 5000 ms one waits 3 s more.
    expect(circles[0]).toHaveClass("elab-field-dim");
    expect(circles[1]).toHaveClass("elab-field-dim");
    expect(circles[2]).toHaveClass("elab-field-out");
    expect(circles[2]).toHaveStyle({ "--delay": "-1100ms" });
    expect(circles[3]).toHaveStyle({ "--delay": "3000ms" });
    expect(circles[4]?.getAttribute("class")).toBeNull();
  });

  test("goes live dimmed under reduced motion", () => {
    const { container } = render(
      <FieldDots dots={field} viewBox="-1 -1 6 3" radius={0.3} />,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    svg.getScreenCTM = () => null;
    fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });
    const out = container.querySelectorAll("g[fill] > circle.elab-field-dim");
    expect(out).toHaveLength(4);
  });
});
