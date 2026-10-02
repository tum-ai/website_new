"use client";

import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useRef,
} from "react";
import { Section } from "@/components/ds";
import { useMediaQuery } from "@/lib/use-media-query";

/** Pixels per line, for wheel events that report lines (Firefox). */
const LINE_PX = 16;

/**
 * A wheel event's travel in reel rows. Trackpads report small pixel steps,
 * mouse wheels larger ones or lines; a row of travel takes a little more than
 * a row of wheel, so a flick moves a name or two, not ten.
 */
export function wheelRows(
  deltaY: number,
  deltaMode: number,
  rowPx: number,
): number {
  const px =
    deltaMode === 1
      ? deltaY * LINE_PX
      : deltaMode === 2
        ? deltaY * rowPx
        : deltaY;
  return px / (rowPx * 1.4);
}

/**
 * The wheel travel along the gesture's main axis: a mostly horizontal
 * gesture (trackpad swipe, tilt wheel) turns the reel by its x travel, any
 * other by its y travel. Every wheel event over the names turns the reel, as
 * long as the pointer is there, except a zoom gesture (Ctrl-wheel, trackpad
 * pinch); the page scrolls as usual everywhere else in the hero, and on touch
 * a vertical swipe always scrolls the page and a pinch zooms it
 * (`touch-action: pan-y pinch-zoom`).
 */
export function reelWheelTravel(deltaX: number, deltaY: number): number {
  return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
}

/** Movement in px before a drag commits to an axis. */
const AXIS_LOCK_PX = 6;

/** Where a drag lands: the nearest name after a short throw in its direction. */
export function settle(position: number, velocityRows = 0): number {
  return Math.round(position + velocityRows * 0.25);
}

/** The share of the remaining distance the reel covers per 60 Hz frame. */
const GLIDE = 0.16;

/** How long the wheel must rest before the reel snaps to a name. */
const WHEEL_REST_MS = 140;

/** The longest the load roll waits for the reel's logos. */
export const REEL_READY_CAP_MS = 2500;

/**
 * Resolves once `img` has loaded or failed (a broken logo must not hold the
 * roll). `stop` detaches the listeners, for a reel that unmounts first.
 */
export function imageSettled(img: HTMLImageElement, stop: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (img.complete) return resolve();
    const done = () => resolve();
    img.addEventListener("load", done, { once: true, signal: stop });
    img.addEventListener("error", done, { once: true, signal: stop });
  });
}

/** The host panels in their current document order. */
const hostPanels = (band: HTMLElement) => [
  ...band.querySelectorAll<HTMLElement>("[data-host-panel]"),
];

/** Marks the panel at `index` active and every other one inactive. */
function showPanel(panels: readonly HTMLElement[], index: number) {
  panels.forEach((panel, at) => {
    panel.toggleAttribute("data-active", at === index);
  });
}

/**
 * The events hero's band and its reel: the names window turns (without end,
 * in both directions) and snaps to the nearest name when the input stops.
 *
 * - Drag: along either axis with a mouse or pen. On touch the window has
 *   `touch-action: pan-y pinch-zoom` (events.css), so a vertical swipe
 *   scrolls the page as everywhere else, a pinch zooms it and a horizontal
 *   swipe turns the reel.
 * - Wheel: over the names, both axes turn it ({@link reelWheelTravel});
 *   Ctrl-wheel and trackpad pinch still zoom the page.
 * - Keys: with focus, the arrow keys step it.
 *
 * The markup comes from the server; this writes the position as `--roll`
 * (rows within one turn, so the reel's three copies wrap without a seam),
 * marks the panel of the name in the slot, and moves only a transform. The
 * panels are decorative (`aria-hidden`), so a polite live region, added
 * with the reel, announces the name in the slot whenever the reel comes to
 * rest after a turn. It does nothing under reduced motion, where the hero
 * is a static index (see events.css), and follows the setting when it
 * changes.
 *
 * The load roll (CSS) holds on the first name until this marks the band
 * `data-reel-ready`: once every reel image has loaded or failed, or after
 * {@link REEL_READY_CAP_MS}, whichever comes first. Set once and kept, as the
 * roll happens once.
 */
export function HeroReel({
  names,
  style,
  ...props
}: Omit<ComponentProps<typeof Section>, "tone" | "spacing"> & {
  /** The names the reel holds, in order: the co-hosts. */
  names: readonly string[];
}) {
  const count = names.length;
  // By value: a live content refresh hands over an equal but new array,
  // which must not tear the reel down and lose the reader's place.
  const namesKey = names.join("\n");
  const ref = useRef<HTMLElement>(null);
  // The same condition as the reel layout in events.css.
  const reelMode = useMediaQuery("(prefers-reduced-motion: no-preference)");

  // On mount only: a later reorder or motion change must not hold the reel
  // again, the roll has run by then.
  useEffect(() => {
    const band = ref.current;
    if (!band) return;
    const stop = new AbortController();
    const ready = () => {
      if (!stop.signal.aborted) band.toggleAttribute("data-reel-ready", true);
    };
    const cap = window.setTimeout(ready, REEL_READY_CAP_MS);
    const images = band.querySelectorAll<HTMLImageElement>(".events-reel img");
    Promise.all(
      Array.from(images, (img) => imageSettled(img, stop.signal)),
    ).then(ready);
    return () => {
      stop.abort();
      window.clearTimeout(cap);
    };
  }, []);

  useEffect(() => {
    const band = ref.current;
    const region = band?.querySelector<HTMLElement>(".events-names-window");
    if (!band || !region || count < 2 || !reelMode) return;
    const hosts = namesKey.split("\n");

    // Queried per setup: a publish that reorders the hosts moves the keyed
    // panels, and the first one is the host at --roll 0.
    const panels = hostPanels(band);
    showPanel(panels, 0);
    const rowPx = () =>
      region.getBoundingClientRect().height /
        Number(getComputedStyle(region).getPropertyValue("--visible") || 1) ||
      1;

    let current = 0;
    let target = 0;
    let frame = 0;
    let last = 0;
    let active = 0;
    let wheelRest = 0;

    // Rendered by the effect, like the reel itself: the static index needs
    // no announcements.
    const live = document.createElement("p");
    live.className = "sr-only";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    band.append(live);
    let announced = -1;
    /** Says the name in the slot once the reel rests on a new one. */
    const announce = () => {
      if (active === announced) return;
      announced = active;
      live.textContent = `${hosts[active]} in the slot`;
    };

    const render = () => {
      const turn = ((current % count) + count) % count;
      band.style.setProperty("--roll", turn.toFixed(4));
      const next = Math.round(turn) % count;
      if (next !== active) {
        showPanel(panels, next);
        active = next;
      }
    };

    const tick = (now: number) => {
      frame = 0;
      const frames = last ? (now - last) / (1000 / 60) : 1;
      last = now;
      current += (target - current) * (1 - (1 - GLIDE) ** frames);
      if (Math.abs(target - current) < 0.001) current = target;
      render();
      if (current !== target) frame = requestAnimationFrame(tick);
      else {
        last = 0;
        announce();
      }
    };
    const glide = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      // Ctrl-wheel and trackpad pinch (a wheel event with ctrlKey) zoom the page.
      if (event.ctrlKey) return;
      event.preventDefault();
      target += wheelRows(
        reelWheelTravel(event.deltaX, event.deltaY),
        event.deltaMode,
        rowPx(),
      );
      window.clearTimeout(wheelRest);
      wheelRest = window.setTimeout(() => {
        target = settle(target);
        glide();
      }, WHEEL_REST_MS);
      glide();
    };

    let drag: {
      id: number;
      x: number;
      y: number;
      /** The axis the drag moves along, once it has moved AXIS_LOCK_PX. */
      axis: "x" | "y" | null;
      from: number;
      t: number;
      v: number;
    } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        axis: null,
        from: target,
        t: event.timeStamp,
        v: 0,
      };
      region.setPointerCapture(event.pointerId);
      region.dataset.dragging = "";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX) return;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      const next = drag.from - (drag.axis === "x" ? dx : dy) / rowPx();
      const dt = Math.max(event.timeStamp - drag.t, 1);
      drag.v = ((next - target) / dt) * 1000;
      drag.t = event.timeStamp;
      target = next;
      current = next;
      render();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      target = settle(target, drag.v);
      drag = null;
      delete region.dataset.dragging;
      glide();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const step =
        event.key === "ArrowDown" || event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowUp" || event.key === "ArrowLeft"
            ? -1
            : 0;
      if (!step) return;
      event.preventDefault();
      target = Math.round(target) + step;
      glide();
    };

    // Only the reel is interactive; the static index stays a plain list.
    region.tabIndex = 0;
    region.setAttribute("role", "group");
    region.setAttribute(
      "aria-label",
      "Co-hosts: scroll, drag or use the arrow keys to turn",
    );
    region.addEventListener("wheel", onWheel, { passive: false });
    region.addEventListener("pointerdown", onPointerDown);
    region.addEventListener("pointermove", onPointerMove);
    region.addEventListener("pointerup", onPointerUp);
    region.addEventListener("pointercancel", onPointerUp);
    region.addEventListener("keydown", onKeyDown);
    render();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(wheelRest);
      region.removeAttribute("tabindex");
      region.removeAttribute("role");
      region.removeAttribute("aria-label");
      region.removeEventListener("wheel", onWheel);
      region.removeEventListener("pointerdown", onPointerDown);
      region.removeEventListener("pointermove", onPointerMove);
      region.removeEventListener("pointerup", onPointerUp);
      region.removeEventListener("pointercancel", onPointerUp);
      region.removeEventListener("keydown", onKeyDown);
      band.style.removeProperty("--roll");
      // Back to the server markup: the first host's panel, as at --roll 0,
      // in the current order (a reorder has already moved the panels).
      showPanel(hostPanels(band), 0);
      delete region.dataset.dragging;
      live.remove();
    };
  }, [count, namesKey, reelMode]);

  return (
    <Section
      ref={ref}
      tone="night"
      spacing="none"
      style={{ ...style, "--names": count } as CSSProperties}
      {...props}
    />
  );
}
