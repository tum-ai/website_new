"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ConstructionLines } from "./construction-lines";
import type { HomePhoto } from "./data/homepage";

/** How long each photo holds before the next one fades in. */
const HOLD_MS = 6000;

/**
 * The next photo index, or the same one when cycling should hold: fewer than
 * two photos, reduced motion, the hero off screen or the tab hidden.
 */
export function nextPhotoIndex(
  current: number,
  count: number,
  canCycle: boolean,
): number {
  if (!canCycle || count < 2) return current;
  return (current + 1) % count;
}

/**
 * The hero's one bold element: the TUM.ai logomark, cropped large as on the
 * brand guide's section slides, as a window onto real event photos that
 * crossfade slowly inside its strokes. The construction-grid hairlines from
 * the guide's logo page sit around it.
 *
 * Performance contract (test/perf/homepage.perf.ts): the photos mount only
 * after hydration, so the server HTML carries no photo and the logo stays the
 * page's only image preload. Until then the mark shows as a flat tonal shape.
 * The crossfade pauses while the hero is off screen or the tab is hidden, and
 * never runs under reduced motion.
 */
export function HeroAperture({
  photos,
  className,
}: {
  photos: HomePhoto[];
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    observer.observe(root);

    const timer = window.setInterval(() => {
      const canCycle =
        visible && !reduced.matches && document.visibilityState === "visible";
      setIndex((current) => nextPhotoIndex(current, photos.length, canCycle));
    }, HOLD_MS);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [photos.length]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <ConstructionLines className="absolute inset-0 size-full text-violet-300" />

      <div className="home-aperture absolute inset-0 bg-violet-950">
        {mounted
          ? photos.map((photo, photoIndex) => (
              <Image
                key={photo.src}
                src={photo.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 90vw"
                data-active={photoIndex === index}
                className="object-cover opacity-0 transition-opacity duration-1200 ease-in-out-soft data-[active=true]:opacity-100 motion-reduce:transition-none"
                style={{ objectPosition: photo.position }}
              />
            ))
          : null}
        {/* Night rises from the bottom, so the strokes sink into the band. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-violet-950/20" />
      </div>
    </div>
  );
}
