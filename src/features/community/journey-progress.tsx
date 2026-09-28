"use client";

import { useEffect, useState } from "react";

/**
 * Fraction of the viewport height that acts as the "reading line": rails fill
 * up to it and markers light up once their centre has crossed it.
 */
const READING_LINE = 0.4;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** "01" for stage index 0. */
const stageNumber = (index: number) => String(index + 1).padStart(2, "0");

/**
 * DOM hooks the server markup of `JourneySection` exposes to this island:
 * `data-track` (rail, with a `data-fill` child), `data-connector`,
 * `data-marker` (with `data-stage` on step markers) and `data-journey-link`
 * (index links, with `data-stage` and a `data-state` of done/current/next).
 */
function collect(root: HTMLElement) {
  const all = <T extends HTMLElement>(selector: string) =>
    Array.from(root.querySelectorAll<T>(selector));
  return {
    tracks: all("[data-track]").map((track) => ({
      track,
      fill: track.querySelector<HTMLElement>("[data-fill]"),
    })),
    connectors: all("[data-connector]"),
    markers: all("[data-marker]"),
    links: all("[data-journey-link]"),
  };
}

type JourneyProgressProps = {
  /** id of the section whose journey markup this island drives. */
  rootId: string;
  /** Number of stages; the counter reads "current / last". */
  stageCount: number;
};

/**
 * Progress for the /community member journey: fills the rails, lights the
 * markers and tracks the current stage in the side index as the reader
 * scrolls, and renders the stage counter.
 *
 * Progress is written straight to the server-rendered DOM from one
 * rAF-throttled scroll handler, so scrolling re-renders only the counter.
 * Server HTML shows the unfilled path. Under `prefers-reduced-motion` the
 * island draws one static final state (every rail full, every marker lit,
 * the last stage current) and never reads the scroll position.
 */
export function JourneyProgress({ rootId, stageCount }: JourneyProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const lastStage = stageCount - 1;

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const { tracks, connectors, markers, links } = collect(root);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /** Paints every part; `progressOf` gives a box's fill from 0 to 1. */
    const paint = (
      progressOf: (element: HTMLElement) => number,
      isLit: (marker: HTMLElement) => boolean,
      stage: number,
    ) => {
      for (const { track, fill } of tracks) {
        if (fill) fill.style.transform = `scaleY(${progressOf(track)})`;
      }
      for (const connector of connectors) {
        connector.style.opacity = String(progressOf(connector));
      }
      for (const marker of markers) {
        marker.toggleAttribute("data-lit", isLit(marker));
      }
      for (const link of links) {
        const index = Number(link.dataset.stage);
        link.dataset.state =
          index < stage ? "done" : index === stage ? "current" : "next";
      }
      setCurrentStage(stage);
    };

    const paintFinal = () =>
      paint(
        () => 1,
        () => true,
        lastStage,
      );

    const paintScroll = () => {
      const line = window.innerHeight * READING_LINE;
      const passed = (marker: HTMLElement) => {
        const rect = marker.getBoundingClientRect();
        return rect.top + rect.height / 2 <= line;
      };
      let reached = 0;
      for (const marker of markers) {
        if (marker.dataset.stage && passed(marker)) {
          reached = Math.max(reached, Number(marker.dataset.stage));
        }
      }
      paint(
        (element) => {
          const rect = element.getBoundingClientRect();
          return clamp01((line - rect.top) / Math.max(rect.height, 1));
        },
        passed,
        reached,
      );
    };

    let frame = 0;
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          paintScroll();
        });
      }
    };

    const stopScroll = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const start = () => {
      stopScroll();
      if (reducedMotion.matches) {
        paintFinal();
        return;
      }
      paintScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    };

    start();
    reducedMotion.addEventListener("change", start);
    return () => {
      stopScroll();
      reducedMotion.removeEventListener("change", start);
    };
  }, [rootId, lastStage]);

  return (
    <p aria-hidden="true" className="mt-10 flex items-baseline gap-3">
      <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em]">
        <span
          key={currentStage}
          data-journey-counter=""
          className="tabular inline-block text-display-xl text-fg motion-safe:animate-rise-sm"
        >
          {stageNumber(currentStage)}
        </span>
      </span>
      <span className="tabular text-fg-subtle text-meta">
        / {stageNumber(lastStage)}
      </span>
    </p>
  );
}
