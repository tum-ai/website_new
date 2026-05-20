import type { ReactNode } from "react";

import { eLabApplicationCopy, eLabConfig } from "@/config/e-lab";
import { cn } from "@/lib/utils";

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
  const stateClassName = eLabConfig.applicationsOpen
    ? openClassName
    : closedClassName;

  if (eLabConfig.applicationsOpen) {
    return (
      <a
        href={eLabConfig.applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={eLabApplicationCopy.ariaLabel}
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
      aria-label={eLabApplicationCopy.ariaLabel}
      className={cn(className, "select-none", stateClassName)}
    >
      {children}
    </span>
  );
}
