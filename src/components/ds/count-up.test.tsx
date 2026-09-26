import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CountUp } from "./count-up";
import { parseFigure } from "./figure";
import { placeBelowFold, stubMatchMedia, stubObservers } from "./testing";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("parseFigure", () => {
  test.each([
    [
      "1.2M+",
      { prefix: "", value: 1.2, decimals: 1, grouping: false, suffix: "M+" },
    ],
    [
      "20k+",
      { prefix: "", value: 20, decimals: 0, grouping: false, suffix: "k+" },
    ],
    [
      "2.3%",
      { prefix: "", value: 2.3, decimals: 1, grouping: false, suffix: "%" },
    ],
    [
      "~500",
      { prefix: "~", value: 500, decimals: 0, grouping: false, suffix: "" },
    ],
    [
      "2,100+",
      { prefix: "", value: 2100, decimals: 0, grouping: true, suffix: "+" },
    ],
    [
      "+1000",
      { prefix: "+", value: 1000, decimals: 0, grouping: false, suffix: "" },
    ],
    [
      "€4.5M",
      { prefix: "€", value: 4.5, decimals: 1, grouping: false, suffix: "M" },
    ],
  ])("splits %s", (text, expected) => {
    expect(parseFigure(text)).toEqual(expected);
  });

  test.each(["2019–2024", "24/7", "many", ""])(
    "leaves %j alone (no single number)",
    (text) => {
      expect(parseFigure(text)).toBeNull();
    },
  );
});

describe("CountUp", () => {
  test("renders the exact source text on the server and for screen readers", () => {
    stubMatchMedia();
    stubObservers();
    render(<CountUp value="1.2M+" />);
    expect(
      screen.getByText("1.2M+", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });

  test("formats numbers with prefix, suffix, decimals and grouping", () => {
    stubMatchMedia();
    stubObservers();
    render(<CountUp value={2100} prefix="~" suffix="+" />);
    expect(
      screen.getByText("~2,100+", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });

  test("starts a below-the-fold figure from zero in the source format", () => {
    stubMatchMedia();
    stubObservers();
    placeBelowFold();
    const { container } = render(<CountUp value="2,100+" />);
    const visible = container.querySelector('[aria-hidden="true"]');
    expect(visible).toHaveTextContent("0+");
    expect(
      screen.getByText("2,100+", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });

  test("keeps text that holds no single number as it is", () => {
    stubMatchMedia();
    stubObservers();
    placeBelowFold();
    const { container } = render(<CountUp value="24/7" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      "24/7",
    );
  });

  test("does not animate under reduced motion", () => {
    stubMatchMedia({ reducedMotion: true });
    stubObservers();
    placeBelowFold();
    const { container } = render(<CountUp value="1.2M+" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      "1.2M+",
    );
  });
});
