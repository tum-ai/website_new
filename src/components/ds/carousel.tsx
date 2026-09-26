"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Children,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";

type EmblaOptionsType = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

type CarouselProps = {
  children: ReactNode;
  /** Accessible name, e.g. "Program highlights". */
  label: string;
  options?: EmblaOptionsType;
  /** Width classes for each slide, e.g. "basis-[85%] md:basis-1/2". */
  slideClassName?: string;
  /** Gap between slides in rem. */
  gap?: number;
  /** Hide the arrow/progress controls (e.g. tiny image carousels). */
  controls?: boolean;
  /** Extra classes for the clipping viewport (e.g. rounded corners, aspect). */
  viewportClassName?: string;
  className?: string;
};

/**
 * Swipeable rail (Embla) with arrow buttons, a progress hairline, keyboard
 * arrows on the region, and slide semantics for screen readers.
 */
export function Carousel({
  children,
  label,
  options,
  slideClassName = "basis-[85%] sm:basis-1/2 lg:basis-1/3",
  gap = 1.25,
  controls = true,
  viewportClassName,
  className,
}: CarouselProps) {
  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    ...options,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);
  const slides = Children.toArray(children);

  const sync = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
    setProgress(Math.max(0, Math.min(1, api.scrollProgress())));
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    api.on("select", sync).on("reInit", sync).on("scroll", sync);
    return () => {
      api.off("select", sync).off("reInit", sync).off("scroll", sync);
    };
  }, [api, sync]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      api?.scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      api?.scrollNext();
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDownCapture={handleKeyDown}
      className={cn("relative", className)}
    >
      <div
        ref={viewportRef}
        className={cn("overflow-hidden", viewportClassName)}
      >
        <div
          className="flex touch-pan-y"
          style={{ gap: `${gap}rem` } as CSSProperties}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              className={cn("min-w-0 shrink-0 grow-0", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      {controls && (canPrev || canNext) ? (
        <div className="mt-8 flex items-center gap-6">
          <div
            aria-hidden
            className="relative h-px flex-1 overflow-hidden bg-hairline"
          >
            <div
              className="absolute inset-y-0 left-0 w-full origin-left bg-fg transition-transform duration-300 ease-brand"
              style={{ transform: `scaleX(${Math.max(progress, 0.06)})` }}
            />
          </div>
          <div className="flex gap-2">
            <IconButton
              aria-label="Previous slide"
              variant="outline"
              focusableWhenDisabled
              disabled={!canPrev}
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft aria-hidden className="size-4" />
            </IconButton>
            <IconButton
              aria-label="Next slide"
              variant="outline"
              focusableWhenDisabled
              disabled={!canNext}
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight aria-hidden className="size-4" />
            </IconButton>
          </div>
        </div>
      ) : null}
    </section>
  );
}
