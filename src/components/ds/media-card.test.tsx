import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MediaCard } from "./media-card";

describe("MediaCard", () => {
  test("the title link names the whole card", () => {
    render(
      <MediaCard
        href="/events"
        image={{ src: "/assets/home_img4.webp", alt: "" }}
        title="Events"
      />,
    );
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Events",
    );
  });

  test("shows the fallback when there is no image", () => {
    render(
      <MediaCard
        image={{ alt: "" }}
        title="Workshop"
        fallback={<span data-testid="fallback" />}
      />,
    );
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  test("swaps to the fallback when the image fails to load", () => {
    const { container } = render(
      <MediaCard
        image={{ src: "/missing.webp", alt: "Poster" }}
        title="Workshop"
        fallback={<span data-testid="fallback" />}
      />,
    );
    fireEvent.error(screen.getByRole("img", { name: "Poster" }));
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  test("uses the brand panel as the default fallback", () => {
    const { container } = render(
      <MediaCard image={{ alt: "" }} title="Workshop" />,
    );
    expect(container.querySelector('[data-tone="ink"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  test("replaces or removes the corner hint", () => {
    const { rerender } = render(
      <MediaCard
        href="/events"
        image={{ alt: "" }}
        title="Events"
        cornerHint={<span data-testid="hint">New</span>}
      />,
    );
    expect(screen.getByTestId("hint").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    rerender(
      <MediaCard
        href="/events"
        image={{ alt: "" }}
        title="Events"
        cornerHint={null}
      />,
    );
    expect(screen.queryByTestId("hint")).toBeNull();
  });

  test("announces external links as opening a new tab", async () => {
    const { container } = render(
      <MediaCard
        href="https://example.com"
        image={{ src: "/assets/home_img4.webp", alt: "" }}
        title="Partner story"
        layout="stacked"
      />,
    );
    expect(
      screen.getByRole("link", {
        name: /^Partner story\s?\(opens in a new tab\)$/,
      }),
    ).toHaveAttribute("target", "_blank");
    expect(await axe(container)).toHaveNoViolations();
  });
});
