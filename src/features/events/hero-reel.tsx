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
 * The wheel travel the reel takes, or `null` to leave the event to the page.
 * A mostly horizontal gesture (trackpad swipe, tilt wheel) always turns the
 * reel: the page has no horizontal scroll to lose. A vertical one turns it
 * only while the reel is `engaged` (it has focus: the reader clicked, tapped
 * or tabbed into it), so scrolling the page past the hero never gets caught
 * in the reel. Blur (click elsewhere, Tab, Escape) hands the wheel back.
 */
export function reelWheelDelta(
  deltaX: number,
  deltaY: number,
  engaged: boolean,
): number | null {
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX;
  return engaged ? deltaY : null;
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

/**
 * The events hero's band and its reel: the names window turns (without end,
 * in both directions) and snaps to the nearest name when the input stops.
 *
 * - Drag: along either axis with a mouse or pen. On touch the window has
 *   `touch-action: pan-y` (events.css), so a vertical swipe scrolls the page
 *   as everywhere else and a horizontal swipe turns the reel.
 * - Wheel: see {@link reelWheelDelta}; horizontal always, vertical only
 *   once the reel has focus.
 * - Keys: with focus, the arrow keys step it.
 *
 * The markup comes from the server; this writes the position as `--roll`
 * (rows within one turn, so the reel's three copies wrap without a seam),
 * marks the panel of the name in the slot, and moves only a transform. It
 * does nothing under reduced motion, where the hero is a static index (see
 * events.css), and follows the setting when it changes.
 */
export function HeroReel({
  count,
  style,
  ...props
}: Omit<ComponentProps<typeof Section>, "tone" | "spacing"> & {
  /** How many names the reel holds. */
  count: number;
}) {
  const ref = useRef<HTMLElement>(null);
  // The same condition as the reel layout in events.css.
  const reelMode = useMediaQuery("(prefers-reduced-motion: no-preference)");

  useEffect(() => {
    const band = ref.current;
    const region = band?.querySelector<HTMLElement>(".events-names-window");
    if (!band || !region || count < 2 || !reelMode) return;

    const panels = [...band.querySelectorAll<HTMLElement>("[data-host-panel]")];
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

    const render = () => {
      const turn = ((current % count) + count) % count;
      band.style.setProperty("--roll", turn.toFixed(4));
      const next = Math.round(turn) % count;
      if (next !== active) {
        panels[active]?.removeAttribute("data-active");
        panels[next]?.setAttribute("data-active", "");
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
      else last = 0;
    };
    const glide = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      const delta = reelWheelDelta(
        event.deltaX,
        event.deltaY,
        region.contains(document.activeElement),
      );
      if (delta === null) return;
      event.preventDefault();
      target += wheelRows(delta, event.deltaMode, rowPx());
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
    };
  }, [count, reelMode]);

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
