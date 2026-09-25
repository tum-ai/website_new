import { cn } from "@/lib/utils";

/**
 * Eases the top of a dark hero into its flat canvas color. Mobile browsers
 * paint their status/tab bar in the page's theme color (dark indigo, see
 * layout.tsx), so without this the aurora and logomark meet that flat bar at
 * a visible edge. Place inside the hero `Section`, after its decorative
 * layers: it sits above them (-z-[5]) and below the content.
 */
export function TopBlend({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-[5] h-[clamp(9rem,24vh,15rem)]",
        "bg-[linear-gradient(to_bottom,var(--tone-canvas)_0%,color-mix(in_srgb,var(--tone-canvas)_88%,transparent)_22%,color-mix(in_srgb,var(--tone-canvas)_55%,transparent)_55%,color-mix(in_srgb,var(--tone-canvas)_18%,transparent)_82%,transparent_100%)]",
        className,
      )}
    />
  );
}
