"use client";

import type { VariantProps } from "class-variance-authority";
import {
  type ComponentPropsWithoutRef,
  type PointerEvent,
  useCallback,
  useRef,
} from "react";
import { cn } from "@/lib/cn";
import { cardStyles } from "./card";

type SpotlightCardProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof cardStyles>;

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
  ...props
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const handleMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (event.pointerType === "touch") return;
      const node = ref.current;
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
      ref.current?.style.setProperty("--spot-opacity", "0");
    },
    [onPointerLeave],
  );

  return (
    <div
      ref={ref}
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
