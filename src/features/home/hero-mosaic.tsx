"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef } from "react";
import { useBreakpoint } from "@/components/ds";
import { pictures } from "./data/homepage";

const COLUMN_COUNT = 4;
const TILES_PER_COLUMN = 5;

/** Spreads the photos so no row repeats a picture next to itself. */
const columns = Array.from({ length: COLUMN_COUNT }, (_, column) =>
  Array.from(
    { length: TILES_PER_COLUMN },
    (_, row) => pictures[(column + row * COLUMN_COUNT) % pictures.length],
  ),
);

const columnMotion = [
  { direction: "up", duration: 96, offset: "0%" },
  { direction: "down", duration: 118, offset: "-18%" },
  { direction: "up", duration: 104, offset: "-34%" },
  { direction: "down", duration: 126, offset: "-8%" },
] as const;

/**
 * Ambient photo wall behind the home hero: tilted columns of community photos
 * drifting in opposite directions, tinted into the ink band and veiled so the
 * headline stays legible.
 *
 * Client-only by design: it renders nothing on the server and on small
 * screens, so the prerendered HTML carries no photo tiles and no image
 * preloads (asserted by test/homepage-performance.test.ts). The wall pauses
 * while the hero is off screen and stays still under reduced motion.
 */
export function HeroMosaic() {
  const enabled = useBreakpoint("md");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!enabled || !node) return;
    const observer = new IntersectionObserver(([entry]) => {
      node.dataset.paused = entry?.isIntersecting ? "false" : "true";
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="home-mosaic pointer-events-none absolute inset-0 -z-10 overflow-hidden motion-safe:animate-fade motion-safe:[animation-duration:1.8s]"
    >
      <div className="absolute -top-[28%] -right-[10%] h-[160%] w-[70%] rotate-[-9deg] opacity-55 lg:w-[62%]">
        <div className="grid h-full grid-cols-3 gap-4 lg:grid-cols-4 lg:gap-5">
          {columns.map((tiles, index) => {
            const motion = columnMotion[index];
            return (
              <div
                key={motion.offset}
                className={index === 3 ? "hidden lg:block" : undefined}
                style={{ transform: `translateY(${motion.offset})` }}
              >
                <div
                  data-direction={motion.direction}
                  className="home-mosaic-column flex flex-col gap-4 lg:gap-5"
                  style={
                    {
                      "--mosaic-duration": `${motion.duration}s`,
                    } as CSSProperties
                  }
                >
                  {/* Two copies, so the loop wraps without a seam. */}
                  {["a", "b"].flatMap((copy) =>
                    tiles.map((picture) => (
                      <div
                        key={`${copy}:${picture.src}`}
                        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/5"
                      >
                        <Image
                          src={picture.src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 15vw, 22vw"
                          className="object-cover grayscale"
                        />
                      </div>
                    )),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Duotone: a violet wash over the grayscale photos, then a veil that is
          solid ink under the copy and fades toward the photos. */}
      <div className="absolute inset-0 bg-violet-800/35" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--tone-canvas)_12%,--alpha(var(--color-violet-950)/82%)_44%,--alpha(var(--color-violet-950)/28%)_78%,--alpha(var(--color-violet-950)/10%))]" />
      <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-canvas/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-canvas via-canvas/70 to-transparent" />
    </div>
  );
}
