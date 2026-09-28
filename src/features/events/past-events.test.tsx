import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Event } from "@/lib/types";
import { PastEventCard } from "./past-events";

// Embla measures slides, which jsdom can't lay out; the slide markup is what
// matters here.
vi.mock("embla-carousel-react", () => ({
  default: () => [() => {}, undefined],
}));

const event = (images: string[]): Event => ({
  id: "event-1",
  title: "Makeathon",
  description: "Two days of building.",
  event_date: "2026-04-24T16:00:00Z",
  poster: images[0],
  images,
});

const slides = () =>
  screen
    .queryAllByRole("listitem")
    .filter((item) => item.getAttribute("aria-roledescription") === "slide")
    .map(
      (slide) =>
        new URL((within(slide).getByRole("img") as HTMLImageElement).src)
          .pathname,
    );

describe("PastEventCard photos", () => {
  test("a live update that replaces a poster shared with img shows each photo once", () => {
    // `poster` and `img` reference the same asset: one photo, no carousel.
    const { rerender } = render(
      <PastEventCard event={event(["/a.webp", "/a.webp"])} />,
    );
    expect(slides()).toEqual([]);
    expect(screen.getAllByRole("img")).toHaveLength(1);

    // The editor swaps the poster: two distinct photos, two slides.
    rerender(<PastEventCard event={event(["/b.webp", "/a.webp"])} />);
    expect(slides()).toEqual(["/b.webp", "/a.webp"]);

    // And back: no stale slide survives.
    rerender(<PastEventCard event={event(["/a.webp", "/a.webp"])} />);
    expect(slides()).toEqual([]);
  });
});
