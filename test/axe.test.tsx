import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";

function Toggle() {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => setPressed(!pressed)}
    >
      Mute
    </button>
  );
}

describe("component test setup", () => {
  test("renders with Testing Library and jest-dom matchers", async () => {
    render(<Toggle />);
    const button = screen.getByRole("button", { name: "Mute" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.setup().click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("toHaveNoViolations passes accessible markup", async () => {
    const { container } = render(<Toggle />);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("toHaveNoViolations reports each violation", async () => {
    const { container } = render(
      <div>
        {/* biome-ignore lint/a11y/useAltText: the violation under test. */}
        {/* biome-ignore lint/performance/noImgElement: plain markup for axe. */}
        <img src="/assets/favicon.svg" />
        <button type="button" />
      </div>,
    );
    const results = await axe(container);

    expect(results.violations.map(({ id }) => id).sort()).toStrictEqual([
      "button-name",
      "image-alt",
    ]);
    expect(() => expect(results).toHaveNoViolations()).toThrow(
      /found 2:[\s\S]*button-name[\s\S]*image-alt/,
    );
  });
});
