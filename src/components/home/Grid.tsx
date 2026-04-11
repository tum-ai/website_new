"use client";

import "../../styles/Grid.css";
import { pictures as squares } from "@/data/homepage";
import Image from "next/image";
import { useEffect, useState } from "react";

const MIN_TILE_SIZE = 116;
const MAX_TILE_SIZE = 214;
const GRID_GAP = 12;

function getGridMetrics(width: number, height: number) {
  const cols = Math.max(
    1,
    Math.floor((width + GRID_GAP) / (MAX_TILE_SIZE + GRID_GAP)),
  );
  const rows = Math.max(
    1,
    Math.floor((height + GRID_GAP) / (MAX_TILE_SIZE + GRID_GAP)),
  );

  return {
    cols,
    rows,
    tileSize: Math.min(
      Math.max(
        Math.floor((width - GRID_GAP * (cols - 1)) / cols),
        MIN_TILE_SIZE,
      ),
      MAX_TILE_SIZE,
    ),
  };
}

function getTileOpacity(index: number) {
  const opacitySteps = [0.04, 0.08, 0.12, 0.16, 0.1, 0.14];
  return opacitySteps[index % opacitySteps.length];
}

function getTileDelay(index: number) {
  return `${((index * 7) % 20) / 4}s`;
}

export const Grid = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [metrics, setMetrics] = useState(() => ({
    tileSize: 164,
    tileCount: 0,
  }));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    const updateGrid = () => {
      if (!mediaQuery.matches) {
        setIsDesktop(false);
        setMetrics((previous) =>
          previous.tileCount === 0 ? previous : { ...previous, tileCount: 0 },
        );
        return;
      }

      const { cols, rows, tileSize } = getGridMetrics(
        window.innerWidth,
        window.innerHeight,
      );

      setIsDesktop(true);
      setMetrics({
        tileSize,
        tileCount: cols * rows,
      });
    };

    updateGrid();
    mediaQuery.addEventListener("change", updateGrid);
    window.addEventListener("resize", updateGrid);

    return () => {
      mediaQuery.removeEventListener("change", updateGrid);
      window.removeEventListener("resize", updateGrid);
    };
  }, []);

  if (!isDesktop || metrics.tileCount === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 grid"
      style={{
        display: "grid",
        justifyContent: "center",
        alignContent: "center",
        gridTemplateColumns: `repeat(auto-fill, ${metrics.tileSize}px)`,
        gridTemplateRows: `repeat(auto-fill, ${metrics.tileSize}px)`,
        gap: `${GRID_GAP}px`,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: metrics.tileCount }, (_, index) => {
        const square = squares[index % squares.length];
        return (
          <div
            key={`${square.src}-${index}`}
            className="brand-grid-tile animate-opacity relative aspect-square overflow-hidden rounded-xl transition duration-300"
            style={{
              opacity: getTileOpacity(index),
              animationDelay: getTileDelay(index),
            }}
          >
            <Image
              src={square.src}
              alt=""
              aria-hidden
              fill
              sizes={`${metrics.tileSize}px`}
              quality={40}
              className="object-cover mix-blend-overlay"
              loading="lazy"
              fetchPriority="low"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
