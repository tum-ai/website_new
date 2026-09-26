import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { LogoTile, LogoWall } from "./logo-wall";

describe("LogoTile", () => {
  test("shows the artwork named by the organization", () => {
    render(<LogoTile name="NVIDIA" src="/assets/partners/logos/nvidia.webp" />);
    expect(screen.getByRole("img", { name: "NVIDIA" })).toBeInTheDocument();
  });

  test("falls back to the name when the artwork fails to load", () => {
    render(<LogoTile name="Helmholtz" src="/missing.png" />);
    fireEvent.error(screen.getByRole("img", { name: "Helmholtz" }));
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("Helmholtz")).toBeInTheDocument();
  });

  test("sets the name beside a symbol in a wordmark lockup", () => {
    const { container } = render(
      <LogoTile
        name="Y Combinator"
        src="/assets/favicon.svg"
        wordmark="Y Combinator"
        variant="chip"
      />,
    );
    expect(screen.getByText("Y Combinator")).toBeInTheDocument();
    // The symbol is decorative next to the name.
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  test("links out in a new tab and says so", () => {
    render(<LogoTile name="Google" href="https://google.com" />);
    const link = screen.getByRole("link", {
      name: /^Google\s?\(opens in a new tab\)$/,
    });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("links to routes in the same tab", () => {
    render(<LogoTile name="Partners" href="/partners" />);
    expect(screen.getByRole("link", { name: "Partners" })).not.toHaveAttribute(
      "target",
    );
  });

  test("serves remote CMS artwork without the optimizer", () => {
    render(<LogoTile name="Lab" src="https://cdn.sanity.io/images/lab.png" />);
    expect(screen.getByRole("img", { name: "Lab" })).toHaveAttribute(
      "src",
      "https://cdn.sanity.io/images/lab.png",
    );
  });
});

describe("LogoWall", () => {
  test("renders a named list of tiles without axe violations", async () => {
    const { container } = render(
      <LogoWall
        label="Collaborators"
        logos={[
          { name: "NVIDIA", src: "/assets/partners/logos/nvidia.webp" },
          { name: "Helmholtz Munich", href: "https://helmholtz-munich.de" },
        ]}
      />,
    );
    expect(
      screen.getByRole("list", { name: "Collaborators" }).children,
    ).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });
});
