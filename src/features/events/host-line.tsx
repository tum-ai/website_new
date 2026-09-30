import { cn } from "@/lib/cn";
import { formatHosts } from "./events";

/**
 * "With Anthropic, Lovable and Hugging Face": an event's co-hosts as a
 * sentence. Nothing when the event has none.
 */
export function HostLine({
  hosts,
  className,
}: {
  /** The event's co-hosts, in the order editors entered them. */
  hosts: readonly string[];
  className?: string;
}) {
  if (hosts.length === 0) return null;
  return (
    <p className={cn("text-fg-muted", className)}>
      With <span className="text-fg">{formatHosts(hosts)}</span>
    </p>
  );
}
