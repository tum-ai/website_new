import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { BrandMark } from "./brand-mark";

describe("BrandMark", () => {
  test("is decoration hidden from assistive tech", () => {
    const { container } = render(<BrandMark />);
    const mark = container.querySelector("svg");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveAttribute("focusable", "false");
  });

  test("sets the white intensity for dark bands, or leaves the color to the caller", () => {
    const { container, rerender } = render(<BrandMark intensity="faint" />);
    expect(container.querySelector("svg")).toHaveClass("text-white/[0.03]");
    rerender(<BrandMark className="text-violet-200" />);
    const mark = container.querySelector("svg");
    expect(mark).toHaveClass("text-violet-200");
    expect(mark?.getAttribute("class")).not.toMatch(/text-white/);
  });
});
