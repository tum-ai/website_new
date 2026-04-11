"use client";

import { pictures } from "@/data/homepage";
import Image from "next/image";
import { useEffect, useState } from "react";

const FEATURED_TILES = [
  {
    image: pictures[0],
    className:
      "left-[6%] top-[10%] h-48 w-36 rotate-[-6deg] xl:h-56 xl:w-44 2xl:h-64 2xl:w-48",
  },
  {
    image: pictures[4],
    className:
      "left-[24%] top-[18%] h-40 w-52 rotate-[5deg] xl:h-48 xl:w-64 2xl:h-56 2xl:w-72",
  },
  {
    image: pictures[5],
    className:
      "right-[24%] top-[12%] h-48 w-36 rotate-[7deg] xl:h-56 xl:w-44 2xl:h-64 2xl:w-48",
  },
  {
    image: pictures[1],
    className:
      "right-[7%] top-[26%] h-40 w-52 rotate-[-5deg] xl:h-48 xl:w-64 2xl:h-56 2xl:w-72",
  },
  {
    image: pictures[8],
    className:
      "left-[16%] bottom-[10%] h-40 w-56 rotate-[4deg] xl:h-48 xl:w-72 2xl:h-56 2xl:w-80",
  },
  {
    image: pictures[9],
    className:
      "right-[14%] bottom-[7%] h-44 w-60 rotate-[-4deg] xl:h-52 xl:w-72 2xl:h-60 2xl:w-80",
  },
];

export function GridMediaLayer() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const update = () => setIsReady(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden sm:block">
      {FEATURED_TILES.map(({ image, className }) => (
        <div
          key={image.src}
          className={`absolute overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/6 shadow-[0_24px_80px_rgb(13_2_20_/_0.35)] ${className}`}
        >
          <Image
            src={image.src}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 18vw, 16vw"
            quality={45}
            className="object-cover opacity-72 saturate-[0.9]"
            loading="lazy"
            fetchPriority="low"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(13_2_20_/_0.02),rgb(13_2_20_/_0.42))]" />
        </div>
      ))}
    </div>
  );
}
