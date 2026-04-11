import { GridMediaLayer } from "./GridMediaLayer";

const GRID_LINE_COLOR = "rgb(255 255 255 / 0.08)";

export const Grid = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${GRID_LINE_COLOR} 1px, transparent 1px),
            linear-gradient(to bottom, ${GRID_LINE_COLOR} 1px, transparent 1px)
          `,
          backgroundPosition: "center center",
          backgroundSize: "clamp(7rem, 12vw, 13rem) clamp(7rem, 12vw, 13rem)",
        }}
      />
      <div className="absolute top-[12%] left-[8%] h-56 w-56 rounded-[2rem] border border-white/10 bg-white/6 blur-sm" />
      <div className="absolute top-[22%] right-[12%] h-44 w-44 rounded-[1.75rem] border border-white/8 bg-primary/10 blur-sm" />
      <div className="absolute bottom-[16%] left-[18%] h-40 w-40 rounded-[1.5rem] border border-white/8 bg-white/5" />
      <div className="absolute right-[14%] bottom-[10%] h-64 w-64 rounded-[2.25rem] bg-[radial-gradient(circle_at_center,rgb(154_100_217_/_0.28),transparent_72%)]" />
      <GridMediaLayer />
    </div>
  );
};

export default Grid;
