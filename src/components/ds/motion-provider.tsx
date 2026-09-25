"use client";

import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Site-wide motion settings. `LazyMotion strict` keeps framer-motion's bundle
 * small: use `m.*` components (not `motion.*`) inside the app. Transform and
 * layout animations respect the visitor's reduced-motion preference.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
