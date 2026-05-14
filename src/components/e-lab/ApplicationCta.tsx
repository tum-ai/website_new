import type { ReactNode } from "react";

import { eLabApplicationCopy, eLabConfig } from "@/config/e-lab";
import { cn } from "@/lib/utils";

type ELabApplicationCtaProps = {
  children: ReactNode;
  className: string;
  disabledClassName?: string;
};

export function ELabApplicationCta({
  children,
  className,
  disabledClassName = "cursor-not-allowed opacity-90",
}: ELabApplicationCtaProps) {
  if (eLabConfig.applicationsOpen) {
    return (
      <a
        href={eLabConfig.applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={eLabApplicationCopy.ariaLabel}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      aria-label={eLabApplicationCopy.ariaLabel}
      className={cn(className, disabledClassName)}
    >
      {children}
    </button>
  );
}
