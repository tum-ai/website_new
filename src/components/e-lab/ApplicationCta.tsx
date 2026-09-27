"use client";

import type { ReactNode } from "react";

import {
  type ELabApplicationCopy,
  eLabConfig,
  getELabApplicationCopy,
} from "@/config/e-lab";
import { cn } from "@/lib/utils";

import { useELabApplicationsOpen } from "./useELabApplicationsOpen";

type ELabApplicationCtaProps = {
  children: ReactNode;
  className: string;
  openClassName: string;
  closedClassName: string;
};

export function ELabApplicationCta({
  children,
  className,
  openClassName,
  closedClassName,
}: ELabApplicationCtaProps) {
  const isOpen = useELabApplicationsOpen();
  const copy = getELabApplicationCopy(isOpen);
  const stateClassName = isOpen ? openClassName : closedClassName;

  if (isOpen) {
    return (
      <a
        href={eLabConfig.applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.ariaLabel}
        className={cn(className, stateClassName)}
      >
        {children}
      </a>
    );
  }

  return (
    <span
      role="status"
      aria-disabled="true"
      aria-label={copy.ariaLabel}
      className={cn(className, "select-none", stateClassName)}
    >
      {children}
    </span>
  );
}

type ELabApplicationTextProps = {
  field: Exclude<keyof ELabApplicationCopy, "cohortName" | "deadline">;
};

/** Renders a piece of application copy that follows the live open state. */
export function ELabApplicationText({ field }: ELabApplicationTextProps) {
  const isOpen = useELabApplicationsOpen();
  return <>{getELabApplicationCopy(isOpen)[field]}</>;
}
