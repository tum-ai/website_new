"use client";

import {
  type ComponentProps,
  type PointerEvent,
  useCallback,
  useRef,
} from "react";
import { cn } from "@/lib/cn";
import { type CardStyleProps, cardStyles } from "./card";
import { useComposedRef } from "./refs";

/** Props for {@link SpotlightCard}: a div's props plus the card variants. */
export type SpotlightCardProps = ComponentProps<"div"> & CardStyleProps;

/**
 * Card with a soft light that follows the pointer and a glow that traces the
 * border under it. Mouse/pen only; touch and keyboard users see the plain card.
 * Styles live in `.spotlight-surface` (src/styles/index.css).
 */
export function SpotlightCard({
  variant,
  padding,
  interactive,
  className,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: SpotlightCardProps) {
  const own = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRef(own, ref);
  const frame = useRef(0);

  const handleMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (event.pointerType === "touch") return;
      const node = own.current;
      if (!node) return;
      const { clientX, clientY } = event;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--spot-x", `${clientX - rect.left}px`);
        node.style.setProperty("--spot-y", `${clientY - rect.top}px`);
        node.style.setProperty("--spot-opacity", "1");
      });
    },
    [onPointerMove],
  );

  const handleLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      cancelAnimationFrame(frame.current);
      own.current?.style.setProperty("--spot-opacity", "0");
    },
    [onPointerLeave],
  );

  return (
    <div
      ref={composedRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        cardStyles({ variant, padding, interactive }),
        "spotlight-surface",
        className,
      )}
      {...props}
    />
  );
}
