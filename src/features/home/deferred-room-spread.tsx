"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import { ROOM_CELLS, ROOM_GRID } from "./room-layout";

/*
 * The photo spread loads after hydration (ssr: false). This keeps its photos
 * out of the prerendered HTML and out of the first paint's network queue
 * (test/perf/homepage.perf.ts allows only the logo as an image preload). The
 * skeleton reserves the exact final boxes, so the swap doesn't shift layout.
 */

function RoomSpreadSkeleton() {
  return (
    <div aria-hidden className={ROOM_GRID}>
      {ROOM_CELLS.map((layout) => (
        <div key={layout.id} className={cn("flex flex-col", layout.cell)}>
          <div className={cn("flex-1 rounded-4xl bg-sunken", layout.frame)} />
          <div className="mt-4 h-[1.1875rem]" />
        </div>
      ))}
    </div>
  );
}

/** The "In the room" photo spread (see RoomSpread). */
export const DeferredRoomSpread = dynamic(
  () => import("./room-spread").then((m) => m.RoomSpread),
  { ssr: false, loading: RoomSpreadSkeleton },
);
