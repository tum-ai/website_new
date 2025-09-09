import "../../styles/Grid.css"; // Import CSS for animations
import { useEffect, useState } from "react";
import { pictures as squares } from "@/data/homepage";
export const Grid = () => {
  const [tileSize, setTileSize] = useState(164); // Default tile size
  const [tileCount, setTileCount] = useState(0);
  const [gap, setGap] = useState(0);

  useEffect(() => {
    const calculateGrid = () => {
      const minTileSize = 116; // Minimum tile size
      const maxTileSize = 214; // Maximum tile size
      const gap = 12; // Gap between tiles

      const cols = Math.floor((window.innerWidth + gap) / (maxTileSize + gap));
      const rows = Math.floor((window.innerHeight + gap) / (maxTileSize + gap));

      const optimalTileSize = Math.min(
        Math.max(
          Math.floor((window.innerWidth - gap * (cols - 1)) / cols),
          minTileSize,
        ),
        maxTileSize,
      );

      setTileSize(optimalTileSize);
      setTileCount(cols * rows);
      setGap(gap);
    };

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 grid"
      style={{
        display: "grid",
        justifyContent: "center",
        alignContent: "center",
        gridTemplateColumns: `repeat(auto-fill, ${tileSize}px)`,
        gridTemplateRows: `repeat(auto-fill, ${tileSize}px)`,
        gap: `${gap}px`,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: tileCount }).map((_, index) => {
        const square = squares[index % squares.length];
        const randomOpacity = Math.random() * 0.2; // Random initial opacity between 0 and 0.2
        const randomDelay = `${Math.random() * 5}s`; // Random animation delay up to 5 seconds
        return (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden bg-[#6517A1] transform transition duration-300 animate-opacity"
            style={{ opacity: randomOpacity, animationDelay: randomDelay }}
          >
            {square.src && (
              <img
                src={square.src}
                alt=""
                className="w-full h-full object-cover mix-blend-overlay"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
