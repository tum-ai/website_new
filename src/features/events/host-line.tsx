import { cn } from "@/lib/cn";

const list = new Intl.ListFormat("en", { type: "conjunction" });

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
      With <span className="text-fg">{list.format(hosts)}</span>
    </p>
  );
}
