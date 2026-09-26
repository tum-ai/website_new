import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Marquee } from "./marquee";

function Example() {
  return (
    <Marquee label="Partners" duration={30}>
      <a key="nvidia" href="https://nvidia.com">
        NVIDIA
      </a>
      <a key="google" href="https://google.com">
        Google
      </a>
    </Marquee>
  );
}

describe("Marquee", () => {
  test("exposes one named list; the loop copy is inert and hidden", () => {
    const { container } = render(<Example />);
    const list = screen.getByRole("list", { name: "Partners" });
    expect(within(list).getAllByRole("link")).toHaveLength(2);

    const copy = container.querySelector("[data-marquee-copy]");
    expect(copy).toHaveAttribute("aria-hidden", "true");
    expect(copy).toHaveAttribute("inert");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  test("under reduced motion it stops, drops the copy and scrolls by hand", () => {
    const { container } = render(<Example />);
    const track = container.querySelector("[data-marquee-copy]")?.parentElement;
    const root = track?.parentElement;
    // Every animation is gated behind motion-safe; motion-reduce swaps in a
    // static, scrollable row without the duplicate.
    expect(track?.className).toMatch(/(^|\s)motion-safe:animate-marquee(\s|$)/);
    expect(track?.className).not.toMatch(/(^|\s)animate-marquee/);
    expect(container.querySelector("[data-marquee-copy]")).toHaveClass(
      "motion-reduce:hidden",
    );
    expect(root).toHaveClass("motion-reduce:overflow-x-auto");
  });

  test("sets the loop duration and direction", () => {
    const { container } = render(
      <Marquee label="Logos" duration={20} reverse>
        <span key="a">A</span>
      </Marquee>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--marquee-duration")).toBe("20s");
    expect(root.firstElementChild).toHaveClass(
      "motion-safe:animate-marquee-reverse",
    );
  });

  test("has no axe violations", async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
