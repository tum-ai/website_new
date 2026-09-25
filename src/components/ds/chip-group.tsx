"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChipOption = { value: string; label: ReactNode; count?: number };

/**
 * Single-select filter chips (Base UI ToggleGroup: roving focus with arrow
 * keys, `aria-pressed` state). Selection can't be cleared to nothing; pass an
 * "all" option instead.
 */
export function ChipGroup({
  label,
  labelledBy,
  options,
  value,
  onValueChange,
  className,
}: {
  /** Accessible group name, e.g. "Category". */
  label: string;
  /** id of a visible label element; preferred over `label` when present. */
  labelledBy?: string;
  options: ChipOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <ToggleGroup
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0];
        if (selected !== undefined) onValueChange(selected);
      }}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className="group/chip inline-flex h-10 items-center gap-2 rounded-full border border-hairline-strong px-4 text-small font-semibold text-fg-muted transition-[background-color,color,border-color,scale] duration-300 ease-brand hover:border-fg/45 hover:text-fg active:scale-[0.97] data-[pressed]:border-transparent data-[pressed]:bg-fg data-[pressed]:text-canvas"
        >
          {option.label}
          {option.count !== undefined ? (
            <span className="tabular min-w-5 rounded-full bg-fg/10 px-1.5 text-center text-meta group-data-[pressed]/chip:bg-canvas/20">
              {option.count}
            </span>
          ) : null}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
