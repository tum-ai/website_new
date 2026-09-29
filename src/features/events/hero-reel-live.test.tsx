import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

/** A motion preference the test can change, notifying listeners like a browser. */
function stubMotionPreference(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) =>
        listeners.delete(listener),
    })),
  );
  return (next: boolean) => {
    matches = next;
    act(() => {
      for (const listener of [...listeners]) listener();
    });
  };
}

function Reel({ names }: { names: string[] }) {
  return (
    <HeroReel names={names} aria-label="Hosts">
      <div className="events-names-window" />
      {names.map((name, index) => (
        <div
          key={name}
          data-host-panel={index}
          data-active={index === 0 ? "" : undefined}
        />
      ))}
    </HeroReel>
  );
}

const activePanels = () =>
  [...document.querySelectorAll("[data-host-panel]")].flatMap((panel) =>
    panel.hasAttribute("data-active")
      ? [panel.getAttribute("data-host-panel")]
      : [],
  );

test("resets the active panel with the reel when motion is switched off and on", async () => {
  const setMotion = stubMotionPreference(true);
  render(<Reel names={["Acme", "Globex", "Initech"]} />);
  fireEvent.keyDown(screen.getByRole("group", { name: /Co-hosts/ }), {
    key: "ArrowDown",
  });
  await waitFor(() => expect(activePanels()).toStrictEqual(["1"]));

  setMotion(false);
  expect(activePanels()).toStrictEqual(["0"]);
  setMotion(true);
  expect(activePanels()).toStrictEqual(["0"]);
});

test("keeps its place when a refresh hands over the same names", async () => {
  stubMotionPreference(true);
  const { rerender } = render(<Reel names={["Acme", "Globex", "Initech"]} />);
  fireEvent.keyDown(screen.getByRole("group", { name: /Co-hosts/ }), {
    key: "ArrowDown",
  });
  await waitFor(() => expect(activePanels()).toStrictEqual(["1"]));

  const band =
    document.querySelector<HTMLElement>("[data-host-panel]")?.parentElement;
  await waitFor(() =>
    expect(band?.style.getPropertyValue("--roll")).toBe("1.0000"),
  );

  rerender(<Reel names={["Acme", "Globex", "Initech"]} />);
  expect(band?.style.getPropertyValue("--roll")).toBe("1.0000");
  expect(activePanels()).toStrictEqual(["1"]);
});
