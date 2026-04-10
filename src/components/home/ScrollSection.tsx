import { pictures as data } from "@/data/homepage";
import type { CSSProperties } from "react";

type Props = {
  speed?: number;
  aspect?: string;
  aspectW?: number;
  aspectH?: number;
  widthClass?: string;
  widthMode?: "viewport" | "parent" | "fixed";
};

function resolveAspect(
  aspect: string,
  aspectW?: number,
  aspectH?: number,
): [number, number] {
  const parts = aspect.split(":").map((part) => Number(part));

  if (
    parts.length === 2 &&
    parts.every((value) => isFinite(value) && value > 0)
  ) {
    return [parts[0], parts[1]];
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
}

export function ScrollSection({
  speed = 60,
  aspect = "16:10",
  aspectW,
  aspectH,
  widthClass,
  widthMode = "fixed",
}: Props) {
  const doubledData = Array.from({ length: 2 }).flatMap(() => data);
  const [resolvedAspectW, resolvedAspectH] = resolveAspect(
    aspect,
    aspectW,
    aspectH,
  );
  const paddingTopPercent = (resolvedAspectH / resolvedAspectW) * 100;
  const resolvedWidthClass =
    widthClass ??
    (widthMode === "viewport"
      ? "w-[80vw] lg:w-[66.666vw] flex-none"
      : widthMode === "fixed"
        ? "w-80 sm:w-96 lg:w-[32rem] flex-none"
        : "w-[80%] lg:w-2/3 flex-none");

  return (
    <div className="relative w-full overflow-hidden pb-4 md:pb-16">
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 hidden w-32 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent sm:w-40 md:block md:w-48 lg:w-56 xl:w-64" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 hidden w-32 bg-gradient-to-l from-white via-gray-50/70 to-transparent sm:w-40 md:block md:w-48 lg:w-56 xl:w-64" />

      <div
        className="group flex w-max flex-nowrap items-center hover:[&_.marquee-track]:[animation-play-state:paused]"
        style={
          {
            "--marquee-duration": `${Math.max(0.1, speed)}s`,
          } as CSSProperties
        }
      >
        <div className="marquee-track flex flex-nowrap items-center [animation:marquee-scroll_var(--marquee-duration)_linear_infinite] motion-reduce:[animation:none]">
          {doubledData.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className={`${resolvedWidthClass} mx-4`}
            >
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ paddingTop: `${paddingTopPercent}%` }}
              >
                <img
                  src={image.src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={index < data.length ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScrollSection;
