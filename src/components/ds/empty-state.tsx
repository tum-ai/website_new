import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Friendly placeholder for empty lists and filter results. */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center rounded-3xl border border-hairline-strong border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="grid size-14 place-items-center rounded-full bg-fg/[0.06] text-highlight">
          <Icon aria-hidden className="size-6" strokeWidth={1.75} />
        </span>
      ) : null}
      <p className="mt-5 text-fg text-heading-md">{title}</p>
      {children ? (
        <div className="mt-2 max-w-md text-fg-muted text-small">{children}</div>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
