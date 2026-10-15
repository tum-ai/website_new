"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { type CoverFrame, coverSizes } from "@/lib/image-optimization";
import { ConstructionLines } from "./construction-lines";
import type { HomePhoto } from "./data/homepage";
import { constructionMarkMask } from "./logomark-construction";

/** How long each photo holds before the next one fades in. */
const HOLD_MS = 6000;

/** The longest the entrance waits for the first photo before it runs anyway. */
const READY_FALLBACK_MS = 2500;

/**
 * The aperture frame per breakpoint: `.home-aperture-frame` widths in
 * home.css (62rem is where min(58vw, 62rem) caps) and the mark's 477:406
 * box from home-hero.tsx.
 */
const APERTURE_FRAMES: CoverFrame[] = [
  { media: "(min-width: 107rem)", width: 62, unit: "rem", aspect: 477 / 406 },
  { media: "(min-width: 64rem)", width: 58, unit: "vw", aspect: 477 / 406 },
  { media: "(min-width: 40rem)", width: 88, unit: "vw", aspect: 477 / 406 },
  { width: 118, unit: "vw", aspect: 477 / 406 },
];

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
 * Loading: the first photo is in the server HTML and eager, so React
 * preloads it (a responsive preload, sized by `sizes`); it and the logo are
 * the page's only image preloads (test/perf/homepage.perf.ts). The mark's entrance waits for that photo
 * (`data-ready`, see home.css), so shape and image arrive together; after
 * READY_FALLBACK_MS it runs regardless. The other photos mount after
 * hydration. The crossfade pauses while the hero is off screen or the tab is
 * hidden, and never runs under reduced motion.
 */
export function HeroAperture({
  photos,
  className,
}: {
  photos: HomePhoto[];
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);

  // The first photo may finish before hydration, when onLoad has no listener.
  useEffect(() => {
    if (firstRef.current?.complete) setReady(true);
    const fallback = window.setTimeout(() => setReady(true), READY_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, []);

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
      setIndex((current) =>
        nextPhotoIndex(current % photos.length, photos.length, canCycle),
      );
    }, HOLD_MS);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [photos.length]);

  // A live refresh can shorten the list under a later photo.
  const active = photos.length > 0 ? index % photos.length : 0;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-ready={ready}
      className={cn("pointer-events-none select-none", className)}
    >
      {/* Short guides where the mark sits behind the copy, long ones beside it. */}
      <ConstructionLines className="absolute inset-0 size-full text-violet-300 lg:hidden" />
      <ConstructionLines
        reach="long"
        className="absolute inset-0 hidden size-full text-violet-300 lg:block"
      />

      <div
        className="home-aperture absolute inset-0 bg-violet-950"
        style={{ "--mark-mask": constructionMarkMask } as CSSProperties}
      >
        {photos.map((photo, photoIndex) =>
          photoIndex === 0 || mounted ? (
            <Image
              key={photo.src}
              ref={photoIndex === 0 ? firstRef : undefined}
              src={photo.src}
              alt=""
              fill
              sizes={coverSizes(photo, APERTURE_FRAMES)}
              loading={photoIndex === 0 ? "eager" : "lazy"}
              onLoad={photoIndex === 0 ? () => setReady(true) : undefined}
              data-active={photoIndex === active}
              className="object-cover opacity-0 transition-opacity duration-1200 ease-in-out-soft data-[active=true]:opacity-100 motion-reduce:transition-none"
              style={{ objectPosition: photo.objectPosition }}
            />
          ) : null,
        )}
        {/* Night rises from the bottom, so the strokes sink into the band. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-violet-950/20" />
      </div>
    </div>
  );
}
