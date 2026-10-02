import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  isLinkTo,
  RouteImagePreload,
  resetRouteImagePreloadForTests,
  shouldWarmImages,
  warmImages,
} from "./route-image-preload";

const imagesUrl = "/events/hero-images";
const motion = "(prefers-reduced-motion: no-preference)";
const images = [
  { src: "/_next/image?w=640", srcSet: "/a 384w, /b 640w", sizes: "20rem" },
  { src: "/_next/image?w=384", srcSet: "/c 1x, /d 2x" },
];

/** The images the warm-up created, as the browser would fetch them. */
let created: { src: string; srcset: string; sizes: string }[];
let fetchMock: ReturnType<typeof vi.fn>;

/** Every media query matches, or none does. */
function stubMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches, media: query })),
  );
}

function stubConnection(connection?: object) {
  Object.defineProperty(navigator, "connection", {
    value: connection,
    configurable: true,
  });
}

/** requestIdleCallback that runs at once, or never. */
function stubIdle(runs: boolean) {
  vi.stubGlobal(
    "requestIdleCallback",
    vi.fn((callback: () => void) => {
      if (runs) callback();
      return 1;
    }),
  );
  vi.stubGlobal("cancelIdleCallback", vi.fn());
}

beforeEach(() => {
  resetRouteImagePreloadForTests();
  stubMedia(true);
  stubConnection(undefined);
  created = [];
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      srcset = "";
      sizes = "";
      fetchPriority = "auto";
      constructor() {
        created.push(this);
      }
    },
  );
  fetchMock = vi.fn(async () => Response.json(images));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  // Unmount while the idle callback stubs still exist.
  cleanup();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  stubConnection(undefined);
});

test("warms the listed images once, with their srcset and sizes", async () => {
  await warmImages(imagesUrl);
  await warmImages(imagesUrl);
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(fetchMock).toHaveBeenCalledWith(imagesUrl);
  expect(created).toStrictEqual([
    expect.objectContaining({
      src: "/_next/image?w=640",
      srcset: "/a 384w, /b 640w",
      sizes: "20rem",
      fetchPriority: "low",
    }),
    expect.objectContaining({ src: "/_next/image?w=384", sizes: "" }),
  ]);
});

test("drops a failed list: the page loads its images itself", async () => {
  fetchMock.mockRejectedValueOnce(new Error("offline"));
  await expect(warmImages(imagesUrl)).resolves.toBeUndefined();
  expect(created).toStrictEqual([]);
});

test("skips Save-Data, 2G and a media query that does not match", () => {
  expect(shouldWarmImages(motion)).toBe(true);
  stubConnection({ effectiveType: "4g" });
  expect(shouldWarmImages(motion)).toBe(true);
  stubConnection({ effectiveType: "slow-2g" });
  expect(shouldWarmImages()).toBe(false);
  stubConnection({ effectiveType: "2g" });
  expect(shouldWarmImages()).toBe(false);
  stubConnection({ saveData: true, effectiveType: "4g" });
  expect(shouldWarmImages()).toBe(false);
  stubConnection(undefined);
  stubMedia(false);
  expect(shouldWarmImages(motion)).toBe(false);
  expect(shouldWarmImages()).toBe(true);
});

test("knows a link to the route", () => {
  document.body.innerHTML = `
    <a id="nav" href="/events"><span id="label">Events</span></a>
    <a id="hash" href="/events#upcoming-events">Upcoming</a>
    <a id="data" href="/events/hero-images">Data</a>
    <a id="other" href="/partners">Partners</a>
    <a id="away" href="https://example.com/events">Elsewhere</a>`;
  const linksToEvents = (id: string) =>
    isLinkTo(document.getElementById(id), "/events");
  expect(linksToEvents("nav")).toBe(true);
  expect(linksToEvents("label")).toBe(true);
  expect(linksToEvents("hash")).toBe(true);
  expect(linksToEvents("data")).toBe(false);
  expect(linksToEvents("other")).toBe(false);
  expect(linksToEvents("away")).toBe(false);
  expect(isLinkTo(null, "/events")).toBe(false);
});

test("warms once the page is idle", () => {
  stubIdle(true);
  render(<RouteImagePreload route="/events" imagesUrl={imagesUrl} />);
  expect(fetchMock).toHaveBeenCalledOnce();
});

test("warms when the reader points at a link to the route before idle", () => {
  stubIdle(false);
  render(
    <>
      <a href="/partners">Partners</a>
      <a href="/events">Events</a>
      <RouteImagePreload route="/events" imagesUrl={imagesUrl} />
    </>,
  );
  fireEvent.pointerOver(screen.getByRole("link", { name: "Partners" }));
  expect(fetchMock).not.toHaveBeenCalled();
  fireEvent.pointerOver(screen.getByRole("link", { name: "Events" }));
  expect(fetchMock).toHaveBeenCalledOnce();
});

test("does nothing while the media query does not match", () => {
  stubMedia(false);
  stubIdle(true);
  render(
    <>
      <a href="/events">Events</a>
      <RouteImagePreload route="/events" imagesUrl={imagesUrl} media={motion} />
    </>,
  );
  fireEvent.pointerOver(screen.getByRole("link", { name: "Events" }));
  expect(fetchMock).not.toHaveBeenCalled();
});
