"use client";

import { cva } from "class-variance-authority";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";
import { keyedChildren } from "./internal";

type EmblaOptionsType = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

/** Layout of a carousel and its controls. */
export type CarouselVariant = "rail" | "overlay";

const rootStyles = cva("relative", {
  variants: {
    variant: { rail: "", overlay: "h-full" },
  },
});

const viewportStyles = cva("overflow-hidden", {
  variants: {
    variant: { rail: "", overlay: "h-full" },
  },
});

/* `h-full` fills a viewport of definite height and is a no-op otherwise. */
const trackStyles = "flex h-full touch-pan-y";

const controlsStyles = cva("flex items-center", {
  variants: {
    variant: {
      rail: "mt-8 gap-6",
      overlay: "absolute inset-x-4 bottom-4 z-10 gap-4",
    },
  },
});

const buttonStyles = cva("", {
  variants: {
    variant: {
      rail: "",
      overlay: "size-10 border-white/45 bg-ink-950/35 backdrop-blur-sm",
    },
  },
});

/** Class overrides for a carousel's inner parts (merged over the defaults). */
export type CarouselClassNames = {
  /** The clipping viewport (rounded corners, aspect ratio). */
  viewport?: string;
  /** The flex row that holds the slides. */
  track?: string;
  /**
   * Every slide. Replaces the default widths ("basis-[85%] sm:basis-1/2
   * lg:basis-1/3"), so include the width classes you want, e.g. "basis-full".
   */
  slide?: string;
  /** The row with the progress line and the arrows. */
  controls?: string;
  /** The progress line's track. */
  progress?: string;
  /** Both arrow buttons. */
  button?: string;
};

/** Props for {@link Carousel}. */
export type CarouselProps = {
  /** One element per slide. */
  children: ReactNode;
  /** Accessible name of the carousel, e.g. "Program highlights". */
  label: string;
  /** Embla options, merged over `align: "start"` and `containScroll: "trimSnaps"`. */
  options?: EmblaOptionsType;
  /**
   * `rail`: controls in a row under the slides. `overlay`: the carousel
   * fills its parent (a photo frame) and the controls sit on its bottom edge.
   */
  variant?: CarouselVariant;
  /** Gap between slides in rem. Default 1.25. */
  gap?: number;
  /** Show the arrows and progress line when the slides overflow. Default true. */
  controls?: boolean;
  /** Screen-reader label for each slide. Default "2 of 5". */
  slideLabel?: (position: number, total: number) => string;
  /** Class overrides for the inner parts. */
  classNames?: CarouselClassNames;
  /**
   * Width classes for each slide.
   * @deprecated Use `classNames.slide`. Removed in W3.
   */
  slideClassName?: string;
  /**
   * Classes for the clipping viewport.
   * @deprecated Use `classNames.viewport`. Removed in W3.
   */
  viewportClassName?: string;
  /** Classes merged over the root region. */
  className?: string;
};

const defaultSlideLabel = (position: number, total: number) =>
  `${position} of ${total}`;

/**
 * Swipeable rail (Embla) with arrow buttons, a progress line, the arrow keys
 * on the whole region, and APG carousel semantics (a labelled region of
 * slides, each announced as "slide, 2 of 5").
 *
 * An arrow that runs out of slides stays focusable (`aria-disabled`); if it
 * had focus, focus moves to the other arrow, so keyboard users never land on
 * a dead control or lose their place.
 */
export function Carousel({
  children,
  label,
  options,
  variant = "rail",
  gap = 1.25,
  controls = true,
  slideLabel = defaultSlideLabel,
  classNames,
  slideClassName,
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
  const previousButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const slides = keyedChildren(children);

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

  // Keep keyboard focus on a working arrow at either end of the rail.
  useEffect(() => {
    const focused = document.activeElement;
    if (!canNext && canPrev && focused === nextButton.current) {
      previousButton.current?.focus();
    } else if (!canPrev && canNext && focused === previousButton.current) {
      nextButton.current?.focus();
    }
  }, [canPrev, canNext]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // Leave arrow keys to controls inside a slide that handle them. The
    // arrows themselves cancel keys while disabled, so they don't count.
    const fromArrow =
      event.target === previousButton.current ||
      event.target === nextButton.current;
    if (event.defaultPrevented && !fromArrow) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      api?.scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      api?.scrollNext();
    }
  };

  const buttonClassName = cn(buttonStyles({ variant }), classNames?.button);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: arrow keys bubble up from the focusable slides and arrows inside; the region itself takes no focus.
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(rootStyles({ variant }), className)}
    >
      <div
        ref={viewportRef}
        className={cn(
          viewportStyles({ variant }),
          viewportClassName,
          classNames?.viewport,
        )}
      >
        <ul
          className={cn(trackStyles, classNames?.track)}
          style={{ gap: `${gap}rem` }}
        >
          {slides.map(({ key, node }, index) => (
            <li
              key={key}
              aria-roledescription="slide"
              aria-label={slideLabel(index + 1, slides.length)}
              className={cn(
                "min-w-0 shrink-0 grow-0",
                classNames?.slide ??
                  slideClassName ??
                  "basis-[85%] sm:basis-1/2 lg:basis-1/3",
              )}
            >
              {node}
            </li>
          ))}
        </ul>
      </div>
      {controls && (canPrev || canNext) ? (
        <div className={cn(controlsStyles({ variant }), classNames?.controls)}>
          <div
            aria-hidden="true"
            className={cn(
              "relative h-px flex-1 overflow-hidden bg-hairline",
              classNames?.progress,
            )}
          >
            <div
              className="absolute inset-y-0 left-0 w-full origin-left bg-fg transition-transform duration-300 ease-brand motion-reduce:transition-none"
              style={{ transform: `scaleX(${Math.max(progress, 0.06)})` }}
            />
          </div>
          <div className="flex gap-2">
            <IconButton
              ref={previousButton}
              aria-label="Previous slide"
              variant="outline"
              focusableWhenDisabled
              disabled={!canPrev}
              onClick={() => api?.scrollPrev()}
              className={buttonClassName}
            >
              <ArrowLeft aria-hidden className="size-4" />
            </IconButton>
            <IconButton
              ref={nextButton}
              aria-label="Next slide"
              variant="outline"
              focusableWhenDisabled
              disabled={!canNext}
              onClick={() => api?.scrollNext()}
              className={buttonClassName}
            >
              <ArrowRight aria-hidden className="size-4" />
            </IconButton>
          </div>
        </div>
      ) : null}
    </section>
  );
}
