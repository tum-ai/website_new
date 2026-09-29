"use client";

import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useRef,
} from "react";
import { Section } from "@/components/ds";

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

/** Where a drag lands: the nearest name after a short throw in its direction. */
export function settle(position: number, velocityRows = 0): number {
  return Math.round(position + velocityRows * 0.25);
}

/** The share of the remaining distance the reel covers per 60 Hz frame. */
const GLIDE = 0.16;

/** How long the wheel must rest before the reel snaps to a name. */
const WHEEL_REST_MS = 140;

/**
 * The events hero's band and its reel: the names window is a scroll region
 * of its own. Wheel, trackpad, drag and swipe over it turn the reel (without
 * end, in both directions) and it snaps to the nearest name when they stop;
 * with focus, the arrow keys step it. Everywhere else the page scrolls as
 * usual. The markup comes from the server; this writes the position as
 * `--roll` (rows within one turn, so the reel's three copies wrap without a
 * seam), marks the panel of the name in the slot, and moves only a
 * transform. It does nothing under reduced motion, where the hero is a
 * static index (see events.css).
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

  useEffect(() => {
    const band = ref.current;
    const region = band?.querySelector<HTMLElement>(".events-names-window");
    if (!band || !region || count < 2) return;
    const reelMode = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    );
    if (!reelMode.matches) return;

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
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      target += wheelRows(event.deltaY, event.deltaMode, rowPx());
      window.clearTimeout(wheelRest);
      wheelRest = window.setTimeout(() => {
        target = settle(target);
        glide();
      }, WHEEL_REST_MS);
      glide();
    };

    let drag: {
      id: number;
      y: number;
      from: number;
      t: number;
      v: number;
    } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag = {
        id: event.pointerId,
        y: event.clientY,
        from: target,
        t: event.timeStamp,
        v: 0,
      };
      region.setPointerCapture(event.pointerId);
      region.dataset.dragging = "";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const next = drag.from - (event.clientY - drag.y) / rowPx();
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
    };
  }, [count]);

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
