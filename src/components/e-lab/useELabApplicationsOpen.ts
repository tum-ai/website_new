"use client";

import { useSyncExternalStore } from "react";

import {
  eLabConfig,
  getELabApplicationDeadlineMs,
  isELabApplicationOpen,
} from "@/config/e-lab";

// setTimeout overflows above ~24.8 days, so long waits are chained.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    const remaining = getELabApplicationDeadlineMs() - Date.now();
    if (remaining <= 0) return;
    timer = setTimeout(
      () => {
        onChange();
        schedule();
      },
      Math.min(remaining, MAX_TIMEOUT_MS),
    );
  };

  schedule();
  return () => clearTimeout(timer);
}

/**
 * Live open/closed state of E-Lab applications. The server snapshot uses the
 * static config flag so hydration matches the prerendered HTML; the client
 * then re-evaluates against the deadline and flips exactly when it passes.
 */
export function useELabApplicationsOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isELabApplicationOpen(),
    () => eLabConfig.applicationsOpen,
  );
}
