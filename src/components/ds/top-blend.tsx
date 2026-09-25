import { cn } from "@/lib/utils";

/**
 * Eases the edge of a dark band into the flat root canvas color (brand black,
 * see index.css). Safari paints its status bar and bottom toolbar from that
 * canvas at the page's ends, so without this the aurora and logomark of a
 * hero (top) or the footer (bottom) meet the browser chrome at a visible
 * seam. Place inside the band, after its decorative layers: it sits above
 * them (-z-[5]) and below the content.
 */
export function TopBlend({
  edge = "top",
  className,
}: {
  edge?: "top" | "bottom";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 -z-[5] h-[clamp(9rem,24vh,15rem)]",
        edge === "top"
          ? "top-0 bg-[linear-gradient(to_bottom,var(--color-black)_0%,color-mix(in_srgb,var(--color-black)_88%,transparent)_22%,color-mix(in_srgb,var(--color-black)_55%,transparent)_55%,color-mix(in_srgb,var(--color-black)_18%,transparent)_82%,transparent_100%)]"
          : "bottom-0 bg-[linear-gradient(to_top,var(--color-black)_0%,color-mix(in_srgb,var(--color-black)_88%,transparent)_22%,color-mix(in_srgb,var(--color-black)_55%,transparent)_55%,color-mix(in_srgb,var(--color-black)_18%,transparent)_82%,transparent_100%)]",
        className,
      )}
    />
  );
}
