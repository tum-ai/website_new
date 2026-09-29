import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { HeroReel } from "./hero-reel";

beforeEach(() => {
  // Motion allowed: the reel mode.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("announces the name in the slot when the reel comes to rest", async () => {
  render(
    <HeroReel names={["Acme", "Globex", "Initech"]} aria-label="Hosts">
      <div className="events-names-window" />
    </HeroReel>,
  );
  const reel = screen.getByRole("group", { name: /Co-hosts/ });
  const live = document.querySelector("[aria-live='polite']");
  expect(live).toHaveTextContent("");

  fireEvent.keyDown(reel, { key: "ArrowDown" });
  await waitFor(() => expect(live).toHaveTextContent("Globex in the slot"));

  fireEvent.keyDown(reel, { key: "ArrowUp" });
  await waitFor(() => expect(live).toHaveTextContent("Acme in the slot"));
});

test("adds no live region to the static index", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  render(
    <HeroReel names={["Acme", "Globex"]} aria-label="Hosts">
      <div className="events-names-window" />
    </HeroReel>,
  );
  expect(document.querySelector("[aria-live]")).toBeNull();
});
