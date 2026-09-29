import Image from "next/image";
import type { FigurePanel } from "./data/research-copy";

const panelLabels = "abcdefghijklmnopqrstuvwxyz";

function panelLabel(position: number) {
  return panelLabels[position] ?? String(position + 1);
}

/**
 * Figure 1, set like a paper's teaser figure: the panels in one
 * row, labelled a, b, c in the corner as journals do. The row's columns are
 * the photos' aspect ratios as `fr` units, so every panel shares one height
 * exactly; the caption names each panel by its letter.
 */
export function ResearchFigure({ panels }: { panels: FigurePanel[] }) {
  if (panels.length === 0) return null;
  return (
    <figure>
      <div
        className="grid gap-2 md:gap-3"
        style={{
          gridTemplateColumns: panels
            .map(({ width, height }) => `minmax(0, ${width / height}fr)`)
            .join(" "),
        }}
      >
        {panels.map((panel, position) => (
          <div
            key={panel.src}
            className="relative overflow-hidden rounded-2xl bg-sunken"
            style={{ aspectRatio: `${panel.width} / ${panel.height}` }}
          >
            <Image
              src={panel.src}
              alt={panel.alt}
              fill
              sizes={`(min-width: 1024px) ${Math.round(40 / panels.length)}vw, ${Math.round(100 / panels.length)}vw`}
              className="object-cover"
              style={
                panel.position ? { objectPosition: panel.position } : undefined
              }
            />
            <span
              aria-hidden="true"
              className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-canvas/80 font-semibold text-fg text-label-sm leading-none"
            >
              {panelLabel(position)}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-4 text-fg-muted text-small">
        <span className="font-semibold text-fg">Figure 1.</span>{" "}
        {panels.map((panel, position) => (
          <span key={panel.src}>
            {position > 0 ? " " : null}
            <span className="font-semibold text-fg">
              {panelLabel(position)}
            </span>
            , {panel.caption}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
