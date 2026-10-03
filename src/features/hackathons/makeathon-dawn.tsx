"use client";

import { HalftoneField, Sun } from "@tum.ai/ui-kit/halftone";
import { type ReactNode, useRef } from "react";

/**
 * The Makeathon opener's sky: the hour before the Makeathon site's sunrise.
 * The Makeathon's amber dots gather above a horizon and thin out upward,
 * and its sun waits just below the line, showing only its glow and the top
 * of its arc. On makeathon.tum-ai.com the sun rises, so following the link
 * finishes the picture. The dots and sun are from `@tum.ai/ui-kit/halftone`
 * (shared with that site). The dots keep clear of `children`, and the sun
 * lifts a little while the band scrolls by (hackathons.css). Decorative
 * layers are hidden from assistive technology.
 */
export function MakeathonDawn({ children }: { children: ReactNode }) {
  const sunRef = useRef<HTMLSpanElement>(null);
  const clearRef = useRef<HTMLDivElement>(null);
  return (
    <div className="relative isolate flex min-h-[88svh] flex-col justify-end">
      <div
        aria-hidden="true"
        className="mk-sky absolute inset-x-0 bottom-0 -z-10 h-[64%]"
      >
        <HalftoneField
          cell={15}
          fps={30}
          speed={0.6}
          rise={false}
          sunRef={sunRef}
          clearRef={clearRef}
          initial={{ alpha: 0.9, edge: 0.3, fadeTop: [0, 0.78] }}
        />
      </div>
      <div ref={clearRef}>{children}</div>
      <div aria-hidden="true" className="mk-dawn">
        <Sun ref={sunRef} />
      </div>
    </div>
  );
}
