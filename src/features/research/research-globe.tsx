"use client";

import { Minus, Plus } from "lucide-react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/components/ds";
import { cn } from "@/lib/cn";
import { EARTH_RADIUS_KM, type LocatedSite } from "./research";

type Rgb = [number, number, number];

/** The opening view: this latitude, and this many degrees west of home. */
const OPEN_LATITUDE = 30;
const OPEN_WEST = -40;
const THETA_LIMIT = 0.9;
const KEY_TURN = 0.2;
const ZOOM_MIN = 1;
/** Four zoom steps from the full view, where Zurich and Munich separate. */
const ZOOM_MAX = 6.5;
const ZOOM_STEP = 1.6;
/** On-screen gap a site needs to its nearest neighbour to be labelled. */
const LABEL_GAP_PX = 48;
/** cobe draws the globe's radius at this share of the canvas width. */
const GLOBE_RADIUS_SHARE = 0.4;
const MARKER_SIZE = 0.045;
const HOME_MARKER_SIZE = 0.065;
const ARC_WIDTH = 0.6;
const MAP_SAMPLES = 16000;
/** Past this the fixed-size land dots start to merge into a solid mass. */
const MAP_SAMPLES_MAX = 50000;
/** How long the globe redraws after creation, while its map loads. */
const SETTLE_MS = 1500;
/**
 * Share of the remaining distance a zoom covers per animation frame: an
 * ease-out that settles in about half a second at 60 Hz.
 */
const ZOOM_EASE = 0.18;
/** A zoom has arrived once scale and angles are this close to the goal. */
const ZOOM_SETTLED_SCALE = 0.005;
const ZOOM_SETTLED_ANGLE = 0.002;
/**
 * The glide after a drag keeps this share of its speed per frame, so a
 * flick coasts for roughly a second before it rests.
 */
const GLIDE_DECAY = 0.93;
/** One 60 Hz frame in ms: turns the drag's speed (rad/ms) into rad/frame. */
const FRAME_MS = 16;
/** Below this speed (rad/frame) the glide stops. */
const GLIDE_REST = 0.0005;
/** Zoom factor per pixel of a trackpad pinch (ctrl+wheel `deltaY`). */
const PINCH_SENSITIVITY = 0.01;

/**
 * Reads a hex colour token (`--color-violet-300`) as cobe's 0..1 RGB, or
 * `undefined` when it isn't a six-digit hex (the stylesheet hasn't loaded, or
 * the token changed format). The globe then stays hidden, as without WebGL,
 * instead of drawing in stale copies of the brand colours.
 */
function readColor(name: string): Rgb | undefined {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const hex = /^#([0-9a-f]{6})$/i.exec(value)?.[1];
  if (!hex) return undefined;
  return [0, 2, 4].map(
    (start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255,
  ) as Rgb;
}

/**
 * cobe's rotation that puts a latitude and longitude at the globe's centre:
 * `phi` turns it about the poles, `theta` tilts it towards the viewer.
 */
function centerOn([latitude, longitude]: [number, number]) {
  return {
    phi: Math.PI - ((longitude * Math.PI) / 180 - Math.PI / 2),
    theta: (latitude * Math.PI) / 180,
  };
}

/** The longitude at the globe's centre for a cobe `phi`, in -180..180. */
function centerLongitude(phi: number) {
  const degrees = ((1.5 * Math.PI - phi) * 180) / Math.PI;
  return Math.round((((degrees % 360) + 540) % 360) - 180);
}

function describeLongitude(longitude: number) {
  if (longitude === 0) return "Centred on the prime meridian";
  return `Centred on ${Math.abs(longitude)}° ${longitude < 0 ? "west" : "east"}`;
}

const clampZoom = (value: number) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

/** Stands in where ResizeObserver is missing: the globe keeps its size. */
class NoResizeObserver {
  observe() {}
  disconnect() {}
}

/** Imperative handles the effect gives the React controls. */
type GlobeControls = {
  turn: (phi: number, theta: number) => void;
  zoomTo: (zoom: number) => void;
};

/** Whether two site lists hold the same sites (a refresh's equal copy). */
function sameSites(a: readonly LocatedSite[], b: readonly LocatedSite[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * The hero globe: every city TUM.ai does research with, an arc from home
 * (Munich) to each. It draws only when someone moves it, and nothing moves
 * on its own:
 *
 * - turn: drag, or the arrow keys when focused (a slider whose value is the
 *   longitude at the centre), with a short glide after a drag unless
 *   reduced motion is set (read at each gesture, so a change applies at
 *   once);
 * - zoom: the + and − buttons, the + and - keys, or a trackpad pinch
 *   (ctrl+wheel; a plain wheel still scrolls the page). A site is labelled
 *   once the gap to its nearest neighbour spans `LABEL_GAP_PX` on screen,
 *   so home's cluster gains its labels as the view closes in.
 *
 * City labels hang on cobe's CSS anchors where the browser supports anchor
 * positioning (research.css). WebGL renders after hydration from a lazily
 * loaded chunk; without it the box stays empty and the page's lists carry
 * the same facts.
 */
export function ResearchGlobe({
  sites,
  className,
}: {
  /** Sites from `getLabSites`. */
  sites: LocatedSite[];
  className?: string;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const controls = useRef<GlobeControls>({ turn() {}, zoomTo() {} });
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [radius, setRadius] = useState(0);
  const descriptionId = useId();
  const home = sites.find((site) => site.home) ?? sites[0];
  const [longitude, setLongitude] = useState(() =>
    Math.round((home?.location[1] ?? 0) + OPEN_WEST),
  );

  // Kept by value: a live content refresh hands over an equal but new
  // array, which must not rebuild the globe and lose the reader's view.
  const [globeSites, setGlobeSites] = useState(sites);
  if (globeSites !== sites && !sameSites(globeSites, sites)) {
    setGlobeSites(sites);
  }

  useEffect(() => {
    const sites = globeSites;
    const slider = sliderRef.current;
    const host = hostRef.current;
    const home = sites.find((site) => site.home) ?? sites[0];
    if (!slider || !host || !home) return;

    // Read at each use rather than once, so turning reduced motion on or
    // off while the page is open applies to the next zoom or drag.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const others = sites.filter((site) => site !== home);
    // Opens west of home so Europe and the US east coast face the viewer.
    const start = centerOn([OPEN_LATITUDE, home.location[1] + OPEN_WEST]);
    const view = { phi: start.phi, theta: start.theta, scale: ZOOM_MIN };

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "width:100%;height:100%;touch-action:pan-y";
    host.append(canvas);

    let globe: import("cobe").Globe | undefined;
    let cancelled = false;
    let glide = 0;
    let zooming = 0;
    let settling = 0;
    let drag: { x: number; y: number; t: number } | undefined;
    let velocity = 0;

    // Markers and arcs keep their on-screen size as the view zooms. The
    // land dots have a fixed size on the sphere, so their density grows only
    // linearly with the zoom, up to MAP_SAMPLES_MAX.
    const markersAt = (scale: number) =>
      sites.map((site) => ({
        id: site.id,
        location: site.location,
        size: (site.home ? HOME_MARKER_SIZE : MARKER_SIZE) / scale,
        ...(site.home ? { color: [1, 1, 1] as Rgb } : {}),
      }));
    const arcs = others.map((site) => ({
      id: site.id,
      from: home.location,
      to: site.location,
    }));
    let drawnScale = view.scale;
    const render = () => {
      if (!globe) return;
      if (view.scale !== drawnScale) {
        drawnScale = view.scale;
        // cobe bakes the width into the arcs when they are set, so the
        // width goes first and the arcs follow in a second update.
        globe.update({ arcWidth: ARC_WIDTH / view.scale });
        globe.update({
          arcs,
          markers: markersAt(view.scale),
          mapSamples: Math.min(
            MAP_SAMPLES_MAX,
            Math.round(MAP_SAMPLES * view.scale),
          ),
        });
      }
      globe.update({ phi: view.phi, theta: view.theta, scale: view.scale });
    };
    const report = () => setLongitude(centerLongitude(view.phi));

    const turn = (phi: number, theta: number) => {
      // Turns slow down as the view closes in.
      view.phi += phi / view.scale;
      view.theta = Math.max(
        -THETA_LIMIT,
        Math.min(THETA_LIMIT, view.theta + theta / view.scale),
      );
      render();
      if (!drag && !glide) report();
    };

    const homeView = centerOn(home.location);
    // Zooming in from the full view also brings home's cluster to the
    // centre, where the extra room is needed; later zooms keep the centre.
    const zoomTo = (target: number) => {
      const goal = clampZoom(target);
      setZoom(goal);
      cancelAnimationFrame(zooming);
      cancelAnimationFrame(glide);
      glide = 0;
      const focus = view.scale === ZOOM_MIN && goal > ZOOM_MIN;
      // The shorter way round to home's longitude.
      const turnBy =
        ((((homeView.phi - view.phi) % (2 * Math.PI)) + 3 * Math.PI) %
          (2 * Math.PI)) -
        Math.PI;
      const goalPhi = focus ? view.phi + turnBy : view.phi;
      const goalTheta = focus ? homeView.theta : view.theta;
      if (motionQuery.matches) {
        Object.assign(view, { scale: goal, phi: goalPhi, theta: goalTheta });
        render();
        report();
        return;
      }
      const step = () => {
        view.scale += (goal - view.scale) * ZOOM_EASE;
        view.phi += (goalPhi - view.phi) * ZOOM_EASE;
        view.theta += (goalTheta - view.theta) * ZOOM_EASE;
        const settled =
          Math.abs(goal - view.scale) < ZOOM_SETTLED_SCALE &&
          Math.abs(goalPhi - view.phi) < ZOOM_SETTLED_ANGLE &&
          Math.abs(goalTheta - view.theta) < ZOOM_SETTLED_ANGLE;
        if (settled) {
          Object.assign(view, { scale: goal, phi: goalPhi, theta: goalTheta });
        }
        render();
        if (settled) report();
        else zooming = requestAnimationFrame(step);
      };
      zooming = requestAnimationFrame(step);
    };
    controls.current = { turn, zoomTo };

    import("cobe")
      .then(({ default: createGlobe }) => {
        if (cancelled) return;
        const size = host.clientWidth;
        const baseColor = readColor("--color-violet-800");
        const markerColor = readColor("--color-violet-300");
        const glowColor = readColor("--color-violet-950");
        const arcColor = readColor("--color-violet-400");
        if (!baseColor || !markerColor || !glowColor || !arcColor) return;
        try {
          globe = createGlobe(canvas, {
            devicePixelRatio: Math.min(window.devicePixelRatio, 2),
            width: size,
            height: size,
            phi: view.phi,
            theta: view.theta,
            scale: view.scale,
            dark: 1,
            diffuse: 1.1,
            mapSamples: MAP_SAMPLES,
            mapBrightness: 5,
            baseColor,
            markerColor,
            glowColor,
            arcColor,
            arcWidth: ARC_WIDTH,
            arcHeight: 0.28,
            markerElevation: 0.01,
            markers: markersAt(view.scale),
            arcs,
          });
        } catch {
          return;
        }
        setReady(true);
        // cobe loads its map texture asynchronously and draws only on
        // update, so redraw (without moving) until the texture is in.
        const settleUntil = performance.now() + SETTLE_MS;
        const settle = () => {
          render();
          if (performance.now() < settleUntil) {
            settling = requestAnimationFrame(settle);
          }
        };
        settling = requestAnimationFrame(settle);
      })
      .catch(() => {});

    const onDown = (event: PointerEvent) => {
      // Only the primary button drags: a secondary click opens the context
      // menu, which swallows the pointerup and would leave the drag on.
      if (event.button !== 0) return;
      cancelAnimationFrame(glide);
      glide = 0;
      drag = { x: event.clientX, y: event.clientY, t: event.timeStamp };
      velocity = 0;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (event: PointerEvent) => {
      if (!drag) return;
      const size = host.clientWidth || 1;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      const dt = Math.max(1, event.timeStamp - drag.t);
      const dPhi = (dx / size) * Math.PI;
      velocity = dPhi / dt;
      turn(dPhi, (dy / size) * Math.PI * 0.5);
      drag = { x: event.clientX, y: event.clientY, t: event.timeStamp };
    };
    const onUp = () => {
      if (!drag) return;
      drag = undefined;
      canvas.style.cursor = "grab";
      if (motionQuery.matches) {
        report();
        return;
      }
      // A short glide after the drag, decaying to rest.
      let speed = velocity * FRAME_MS;
      const step = () => {
        speed *= GLIDE_DECAY;
        if (Math.abs(speed) < GLIDE_REST) {
          glide = 0;
          report();
          return;
        }
        view.phi += speed / view.scale;
        render();
        glide = requestAnimationFrame(step);
      };
      glide = requestAnimationFrame(step);
    };
    // A trackpad pinch arrives as ctrl+wheel; a plain wheel scrolls the page.
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      cancelAnimationFrame(zooming);
      view.scale = clampZoom(
        view.scale * Math.exp(-event.deltaY * PINCH_SENSITIVITY),
      );
      render();
      setZoom(view.scale);
    };
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("lostpointercapture", onUp);
    slider.addEventListener("wheel", onWheel, { passive: false });

    const resize = new (window.ResizeObserver ?? NoResizeObserver)(() => {
      const size = host.clientWidth;
      setRadius(size * GLOBE_RADIUS_SHARE);
      if (size > 0) globe?.update({ width: size, height: size });
    });
    resize.observe(host);

    return () => {
      cancelled = true;
      cancelAnimationFrame(glide);
      cancelAnimationFrame(zooming);
      cancelAnimationFrame(settling);
      resize.disconnect();
      slider.removeEventListener("wheel", onWheel);
      globe?.destroy();
      controls.current = { turn() {}, zoomTo() {} };
      // The next run starts a fresh globe at the opening view: the state
      // the controls and labels read starts there too.
      setReady(false);
      setZoom(ZOOM_MIN);
      setLongitude(Math.round(home.location[1] + OPEN_WEST));
      // cobe wraps the canvas in its own element inside the host.
      host.replaceChildren();
    };
  }, [globeSites]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const turns: Record<string, [number, number]> = {
      // Right raises the value (the longitude at the centre): the view
      // moves east, so the surface turns the other way.
      ArrowLeft: [KEY_TURN, 0],
      ArrowRight: [-KEY_TURN, 0],
      ArrowUp: [0, -KEY_TURN],
      ArrowDown: [0, KEY_TURN],
    };
    const turn = turns[event.key];
    if (turn) {
      event.preventDefault();
      controls.current.turn(...turn);
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      controls.current.zoomTo(zoom * ZOOM_STEP);
    } else if (event.key === "-") {
      event.preventDefault();
      controls.current.zoomTo(zoom / ZOOM_STEP);
    }
  };

  const places = sites
    .filter((site) => !site.home)
    .map((site) => `${site.city} (${site.institutions.join(", ")})`);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={sliderRef}
        role="slider"
        tabIndex={0}
        aria-label="Globe of our research sites"
        aria-describedby={descriptionId}
        aria-orientation="horizontal"
        aria-valuemin={-180}
        aria-valuemax={180}
        aria-valuenow={longitude}
        aria-valuetext={describeLongitude(longitude)}
        onKeyDown={onKeyDown}
        className="relative aspect-square overflow-hidden rounded-full"
      >
        <p id={descriptionId} className="sr-only">
          Arcs run from {home?.city ?? "Munich"} to {places.join("; ")}. Use the
          arrow keys to turn the globe, and plus and minus to zoom.
        </p>
        <div
          ref={hostRef}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-brand motion-reduce:transition-none",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
        {sites.map((site) => {
          // Home is always labelled; any other site once the gap to its
          // nearest neighbour spans LABEL_GAP_PX at this zoom.
          const gapPx = (site.nearestKm / EARTH_RADIUS_KM) * radius * zoom;
          const shown = ready && (site.home || gapPx >= LABEL_GAP_PX);
          return (
            <span
              key={site.id}
              aria-hidden="true"
              className={cn(
                "research-globe-label rounded-full px-2 py-0.5 font-semibold text-label-sm",
                site.home ? "bg-fg text-canvas" : "bg-canvas/70 text-fg",
              )}
              style={
                {
                  "--anchor": `--cobe-${site.id}`,
                  opacity: shown ? `var(--cobe-visible-${site.id}, 0)` : 0,
                } as CSSProperties
              }
            >
              {site.city}
            </span>
          );
        })}
      </div>
      <div
        className={cn(
          "absolute right-0 bottom-0 flex flex-col gap-2 transition-opacity duration-1000 ease-brand motion-reduce:transition-none",
          ready ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <IconButton
          aria-label="Zoom in"
          size="icon-sm"
          disabled={!ready || zoom >= ZOOM_MAX}
          onClick={() => controls.current.zoomTo(zoom * ZOOM_STEP)}
        >
          <Plus aria-hidden="true" className="size-4" />
        </IconButton>
        <IconButton
          aria-label="Zoom out"
          size="icon-sm"
          disabled={!ready || zoom <= ZOOM_MIN}
          onClick={() => controls.current.zoomTo(zoom / ZOOM_STEP)}
        >
          <Minus aria-hidden="true" className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}
