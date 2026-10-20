import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { HeroReel, REEL_READY_CAP_MS } from "./hero-reel";

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

test("leaves Ctrl-wheel and pinch zoom to the browser", async () => {
  render(<Reel names={["Acme", "Globex", "Initech"]} />);
  const reel = screen.getByRole("group", { name: /Co-hosts/ });

  // Browsers report a trackpad pinch as a wheel event with ctrlKey set.
  expect(fireEvent.wheel(reel, { deltaY: 120, ctrlKey: true })).toBe(true);
  // A plain wheel still turns the reel.
  expect(fireEvent.wheel(reel, { deltaY: 120 })).toBe(false);
});

test("marks the new first host's panel when a publish reorders the hosts", () => {
  const setMotion = stubMotionPreference(true);
  const { rerender } = render(<Reel names={["Acme", "Globex", "Initech"]} />);
  expect(activePanels()).toStrictEqual(["0"]);

  // The keyed panels move before the old reel's cleanup runs.
  rerender(<Reel names={["Globex", "Acme", "Initech"]} />);
  expect(activePanels()).toStrictEqual(["0"]);

  // Reduced motion resets to the first panel in the current order too.
  rerender(<Reel names={["Initech", "Globex", "Acme"]} />);
  setMotion(false);
  expect(activePanels()).toStrictEqual(["0"]);
});

/** A reel image that has not loaded yet, as on a slow connection. */
function PendingLogo({ id }: { id: string }) {
  return (
    // biome-ignore lint/performance/noImgElement: stands in for next/image's rendered <img>
    <img
      alt=""
      data-testid={id}
      ref={(img) => {
        if (img) Object.defineProperty(img, "complete", { value: false });
      }}
    />
  );
}

function LogoReel() {
  return (
    <HeroReel names={["Acme", "Globex"]} aria-label="Hosts">
      <div className="events-names-window">
        <div className="events-reel">
          <PendingLogo id="acme" />
          <PendingLogo id="globex" />
        </div>
      </div>
    </HeroReel>
  );
}

const reelReady = () =>
  screen.getByRole("region", { name: "Hosts" }).hasAttribute("data-reel-ready");

test("starts the load roll once every reel logo has loaded or failed", async () => {
  render(<LogoReel />);
  expect(reelReady()).toBe(false);

  fireEvent.load(screen.getByTestId("acme"));
  await Promise.resolve();
  expect(reelReady()).toBe(false);

  // A broken logo must not hold the roll.
  fireEvent.error(screen.getByTestId("globex"));
  await waitFor(() => expect(reelReady()).toBe(true));
});

test("starts the load roll after the cap when a logo never arrives", () => {
  vi.useFakeTimers();
  try {
    render(<LogoReel />);
    act(() => vi.advanceTimersByTime(REEL_READY_CAP_MS - 1));
    expect(reelReady()).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(reelReady()).toBe(true);
  } finally {
    vi.useRealTimers();
  }
});

test("starts the load roll at once without logos", async () => {
  render(<Reel names={["Acme", "Globex"]} />);
  await waitFor(() => expect(reelReady()).toBe(true));
});
