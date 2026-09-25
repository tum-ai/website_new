import { cn } from "@/lib/utils";

const intensities = {
  subtle: "opacity-50",
  default: "opacity-80",
  vivid: "opacity-100",
} as const;

/**
 * Slow-moving light field for dark bands: three soft radial glows in the brand
 * violets drifting on long, offset loops. Transform-only (compositor friendly)
 * and static under reduced motion. Place inside a `relative isolate` parent.
 */
export function Aurora({
  className,
  intensity = "default",
}: {
  className?: string;
  intensity?: keyof typeof intensities;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        intensities[intensity],
        className,
      )}
    >
      <div className="absolute -top-[35%] -left-[20%] h-[95%] w-[75%] rounded-full bg-[radial-gradient(closest-side,rgb(154_100_217/0.42),transparent)] motion-safe:animate-aurora" />
      <div className="absolute top-[5%] -right-[18%] h-[85%] w-[65%] rounded-full bg-[radial-gradient(closest-side,rgb(82_53_115/0.75),transparent)] [animation-delay:-11s] [animation-direction:alternate-reverse] motion-safe:animate-aurora" />
      <div className="absolute -bottom-[45%] left-[22%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(201_165_239/0.2),transparent)] [animation-delay:-19s] motion-safe:animate-aurora" />
    </div>
  );
}
