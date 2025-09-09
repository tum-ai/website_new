import "../../styles/index.css";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { pictures as data } from "@/data/homepage";
type Props = {
  speed?: number;
  aspect?: string;
  aspectW?: number;
  aspectH?: number;
  widthClass?: string;
  widthMode?: "viewport" | "parent" | "fixed";
};

/**
 * ScrollSection
 *
 * A horizontally-scrolling marquee of image "frames". The component duplicates
 * the provided data programmatically and uses GSAP to animate the track by
 * exactly half the scrollWidth for a smooth, seamless loop.
 *
 * Props
 * - speed?: number
 *   Animation duration in seconds. Passed to GSAP as the duration of the
 *   translation from 0 to -half(scrollWidth). Default: 40
 *
 * - aspect?: string
 *   Aspect ratio as a string like "16:9", "4:3", etc. If provided it will be
 *   parsed and used to compute the padding-top percentage of the frame so the
 *   images are cropped consistently. Default: "16:10"
 *
 * - aspectW?: number, aspectH?: number
 *   Alternative numeric way to provide the aspect ratio (takes precedence
 *   over the fallback). Example: aspectW={4} aspectH={3}.
 *
 * - widthMode?: "viewport" | "parent" | "fixed"
 *   A preset for how the slide width is computed when `widthClass` is not
 *   passed.
 *     - "viewport": viewport-relative sizes (w-[80vw] on mobile, lg:w-[66.666vw] on desktop)
 *     - "parent": percent-of-parent sizes (w-[80%] lg:w-2/3)
 *     - "fixed": fixed responsive sizes (w-80 sm:w-96 lg:w-[32rem])
 *   Default: "parent"
 *
 * - widthClass?: string
 *   If supplied, this Tailwind class string will override the `widthMode`
 *   presets and be applied directly to each slide container. Example:
 *   widthClass="w-[90vw] flex-none".
 *
 * Behavior notes
 * - The component duplicates `data` (internal array) to create a seamless
 *   set of two halves; GSAP then animates the track element from x=0 to x=-half
 *   (half the track's scrollWidth) and repeats infinitely.
 * - Slides are rendered with an inner aspect-ratio box using padding-top; the
 *   image itself is absolutely positioned with object-cover so images are
 *   cropped consistently.
 * - To ensure the width calculations produce the expected visible slides the
 *   slide elements include `flex-none` (preventing shrink/grow). If you want
 *   slides to be exactly a fraction of the viewport, use `widthMode="viewport"`
 *   or pass a vw-based `widthClass`.
 *
 * Implementation notes
 * - Requires `gsap` installed (project already uses it).
 * - Uses ResizeObserver and image onLoad counting to reinitialize the
 *   animation when layout changes so the animation doesn't jump.
 *
 * Example usage
 * <ScrollSection speed={30} aspect="4:3" widthMode="viewport" />
 * <ScrollSection widthClass="w-[90vw] flex-none" aspectW={4} aspectH={3} />
 */
export function ScrollSection({
  speed = 60,
  aspect = "16:10",
  aspectW,
  aspectH,
  widthClass,
  widthMode = "fixed",
}: Props) {
  // create two copies programmatically for a seamless marquee
  const doubledData = Array.from({ length: 2 }).flatMap(() => data);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<any>(null);
  const imagesLoadedRef = useRef(0);

  const parseAspect = (): [number, number] => {
    if (aspect) {
      const parts = aspect.split(":").map((p) => Number(p));
      if (parts.length === 2 && parts.every((n) => isFinite(n) && n > 0)) {
        return [parts[0], parts[1]];
      }
    }
    if (
      aspectW &&
      aspectH &&
      isFinite(aspectW) &&
      isFinite(aspectH) &&
      aspectW > 0 &&
      aspectH > 0
    ) {
      return [aspectW, aspectH];
    }
    return [16, 9];
  };

  const [aspectWResolved, aspectHResolved] = parseAspect();
  const paddingTopPercent = (aspectHResolved / aspectWResolved) * 100;

  const initialize = () => {
    const el = trackRef.current;
    if (!el) return;

    // Reset and kill any existing animation
    tweenRef.current?.kill?.();
    gsap.set(el, { x: 0 });

    const half = el.scrollWidth / 2;
    if (!isFinite(half) || half === 0) return;

    // animate the whole track by exactly half its width
    tweenRef.current = gsap.to(el, {
      x: -half,
      duration: Math.max(0.1, speed),
      ease: "none",
      repeat: -1,
    });
  };

  useEffect(() => {
    // Try to initialize shortly after mount (images might load fast)
    const id = setTimeout(initialize, 120);

    // Reinitialize on resize/flow changes
    const ro = new ResizeObserver(() => initialize());
    if (trackRef.current) ro.observe(trackRef.current);

    return () => {
      clearTimeout(id);
      ro.disconnect();
      tweenRef.current?.kill?.();
    };
  }, [speed]);

  const handleImgLoad = () => {
    imagesLoadedRef.current += 1;
    // when the original set has loaded, initialize
    if (imagesLoadedRef.current >= data.length) {
      initialize();
    }
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* Left fade gradient */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none"></div>
      {/* Right fade gradient */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 bg-gradient-to-l from-white via-gray-50/70 to-transparent z-10 pointer-events-none"></div>

      <div ref={trackRef} className="flex flex-nowrap items-center">
        {doubledData.map((imgObj, idx) => {
          const resolvedWidthClass =
            widthClass ??
            (widthMode === "viewport"
              ? "w-[80vw] lg:w-[66.666vw] flex-none"
              : widthMode === "fixed"
                ? "w-80 sm:w-96 lg:w-[32rem] flex-none"
                : "w-[80%] lg:w-2/3 flex-none");

          return (
            <div
              key={`${imgObj}-${idx}`}
              className={`${resolvedWidthClass} mx-4`}
            >
              <div
                className="relative rounded-lg overflow-hidden"
                style={{ paddingTop: `${paddingTopPercent}%` }}
              >
                <img
                  src={imgObj.src}
                  alt=""
                  onLoad={handleImgLoad}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScrollSection;
