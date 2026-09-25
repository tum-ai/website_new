"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import {
  EXPLORE_CELLS,
  EXPLORE_GRID,
  PHOTO_RAIL_ITEM,
} from "./deferred-layout";

/*
 * The image-heavy home sections load after hydration (ssr: false). This keeps
 * their photos out of the prerendered HTML and out of the first paint's
 * network queue (test/homepage-performance.test.ts allows only the hero logo
 * as an image preload). Skeletons reserve the exact final boxes, so the swap
 * doesn't shift the layout.
 */

function PhotoRailSkeleton() {
  return (
    <div
      aria-hidden
      className="flex gap-5 overflow-hidden mask-fade-x motion-reduce:[mask-image:none]"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className={cn("shrink-0 rounded-3xl bg-sunken", PHOTO_RAIL_ITEM)}
        />
      ))}
    </div>
  );
}

function ExploreBentoSkeleton() {
  return (
    <div aria-hidden className={EXPLORE_GRID}>
      {EXPLORE_CELLS.map((cell, index) => (
        <div key={index} className={cn("rounded-4xl bg-sunken", cell)} />
      ))}
    </div>
  );
}

/** Community photo rail (see ScrollSection). */
export const DeferredPhotoRail = dynamic(
  () => import("./scroll-section").then((m) => m.ScrollSection),
  {
    ssr: false,
    loading: PhotoRailSkeleton,
  },
);

/** Events, Research, Projects and E-Lab bento (see ExploreBento). */
export const DeferredExploreBento = dynamic(
  () => import("./explore-bento").then((m) => m.ExploreBento),
  {
    ssr: false,
    loading: ExploreBentoSkeleton,
  },
);
