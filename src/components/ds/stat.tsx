import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

export type StatItem = {
  /** Numbers count up on scroll; strings render as-is (e.g. "2020"). */
  value: number | string;
  prefix?: string;
  suffix?: string;
  label: ReactNode;
  description?: ReactNode;
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Row of large figures separated by hairlines (definition list semantics:
 * the label is the term, the figure its value).
 */
export function StatGrid({
  items,
  columns = 4,
  size = "lg",
  className,
}: {
  items: StatItem[];
  columns?: keyof typeof columnClasses;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline",
        columnClasses[columns],
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={String(item.label) + String(item.value)}
          className="flex flex-col gap-3 bg-canvas p-6 md:p-8"
        >
          <dt className="order-2 text-small font-medium text-fg-muted">
            {item.label}
          </dt>
          <dd
            className={cn(
              "order-1 font-medium tracking-[-0.05em] text-fg",
              size === "lg"
                ? "text-[clamp(2.75rem,2rem+2.6vw,4.5rem)] leading-none"
                : "text-[clamp(2.25rem,1.8rem+1.4vw,3.25rem)] leading-none",
            )}
          >
            {typeof item.value === "number" ? (
              <CountUp
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
              />
            ) : (
              <span className="tabular">
                {item.prefix}
                {item.value}
                {item.suffix}
              </span>
            )}
          </dd>
          {item.description ? (
            <dd className="order-3 text-meta text-fg-subtle">
              {item.description}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
