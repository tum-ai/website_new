"use client";

import { useEffect } from "react";
import type { ImagePreload } from "@/lib/image-preload";

/** The longest a page waits for idle time before warming anyway. */
const IDLE_TIMEOUT_MS = 4000;

/** The warm-ups started, by list URL: one each per page load, across navigations. */
const warming = new Map<string, Promise<void>>();

/** The single images warmed, by `srcSet` or `src`: one request each per page load. */
const warmed = new Set<string>();

/** Resets the module's state between tests. */
export function resetRouteImagePreloadForTests() {
  warming.clear();
  warmed.clear();
}

/**
 * Fetches one image into the HTTP cache the way an `<img>` with the same
 * `srcSet` and `sizes` would, so that image is a cache hit once it renders.
 * Once per image and page load.
 */
export function warmImage(
  { src, srcSet, sizes }: ImagePreload,
  priority: "high" | "low" | "auto" = "low",
) {
  const key = srcSet ?? src;
  if (warmed.has(key)) return;
  warmed.add(key);
  const image = new Image();
  image.fetchPriority = priority;
  if (sizes) image.sizes = sizes;
  if (srcSet) image.srcset = srcSet;
  image.src = src;
}

/**
 * Whether this visitor can spare the bandwidth: not with Save-Data or on a
 * 2G connection, and `media` (when given) matches.
 */
export function shouldWarmImages(media?: string): boolean {
  if (media && !window.matchMedia(media).matches) return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return !(
    connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")
  );
}

/** Whether `target` sits in a same-origin link to `route` (any hash or query). */
export function isLinkTo(target: EventTarget | null, route: string): boolean {
  const link =
    target instanceof Element
      ? target.closest<HTMLAnchorElement>("a[href]")
      : null;
  if (!link) return false;
  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin && url.pathname === route;
}

/**
 * Fetches the images listed at `imagesUrl` (`ImagePreload[]`) into the HTTP
 * cache at low priority. Once per URL and page load; a failure is dropped,
 * as the page loads its images itself.
 */
export function warmImages(imagesUrl: string): Promise<void> {
  let warm = warming.get(imagesUrl);
  if (!warm) {
    warm = fetch(imagesUrl)
      .then((response) => (response.ok ? response.json() : []))
      .then((images: ImagePreload[]) => {
        for (const image of images) warmImage(image);
      })
      .catch(() => undefined);
    warming.set(imagesUrl, warm);
  }
  return warm;
}

/**
 * Loads a route's above-the-fold images ahead from other pages, so it
 * shows complete right after a navigation: when the page has gone idle
 * (not on `route` itself, which loads them anyway), or earlier when the
 * reader points at, focuses or touches a link to `route`. Skipped with
 * Save-Data, on 2G and when `media` does not match
 * ({@link shouldWarmImages}). Renders nothing.
 */
export function RouteImagePreload({
  route,
  imagesUrl,
  media,
}: {
  /** The route's pathname, e.g. `/events`. */
  route: string;
  /** A same-origin URL that answers the images as `ImagePreload[]` JSON. */
  imagesUrl: string;
  /** A media query the route's images depend on, e.g. a motion preference. */
  media?: string;
}) {
  useEffect(() => {
    if (!shouldWarmImages(media)) return;
    const stop = new AbortController();
    const warm = () => {
      stop.abort();
      void warmImages(imagesUrl);
    };
    const onIntent = (event: Event) => {
      if (isLinkTo(event.target, route)) warm();
    };
    for (const type of ["pointerover", "focusin", "touchstart"]) {
      document.addEventListener(type, onIntent, {
        passive: true,
        signal: stop.signal,
      });
    }

    let cancelIdle = () => {};
    const whenIdle = () => {
      if (window.location.pathname === route) return;
      // Safari has no requestIdleCallback: a second after load instead.
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(warm, {
          timeout: IDLE_TIMEOUT_MS,
        });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(warm, 1000);
        cancelIdle = () => window.clearTimeout(id);
      }
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { signal: stop.signal });

    return () => {
      stop.abort();
      cancelIdle();
    };
  }, [route, imagesUrl, media]);
  return null;
}
