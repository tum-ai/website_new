import Image from "next/image";
import { cn } from "@/lib/cn";
import type { RoomPhoto } from "./data/homepage";
import { ROOM_CELLS, ROOM_GRID } from "./room-layout";

/**
 * The "In the room" photo spread: five event photos in an editorial grid,
 * each with a factual caption. Loaded after hydration (see
 * DeferredRoomSpread).
 */
export function RoomSpread({ photos }: { photos: readonly RoomPhoto[] }) {
  return (
    <div className={ROOM_GRID}>
      {photos.map((photo, index) => {
        const layout = ROOM_CELLS[index];
        return (
          <figure key={photo.src} className={cn("flex flex-col", layout?.cell)}>
            <div
              className={cn(
                "group/zoom relative flex-1 overflow-hidden rounded-4xl bg-sunken",
                layout?.frame,
              )}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={
                  layout?.id === "panorama"
                    ? "(min-width: 1280px) 80rem, 100vw"
                    : "(min-width: 768px) 60vw, 100vw"
                }
                className="zoom-media object-cover"
                style={{ objectPosition: photo.objectPosition }}
              />
            </div>
            <figcaption className="mt-4 text-fg-subtle text-meta">
              {photo.caption}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
