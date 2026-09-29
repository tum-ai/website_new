import type { CSSProperties } from "react";
import { MARK_PITCH, MARK_RADIUS } from "../selection-field";
import { litStep } from "./proof-section";

/**
 * The admitted of one round as lit marks in a row: the selection field's
 * answer in the closing band. Each mark is set at about the field's
 * rendered size (the width follows the column count, not the container):
 * one row from `md` up, two below. Decorative; it lights up left to right
 * with the field's entrance when its Reveal enters.
 */
export function BatchRow({ admitted }: { admitted: number }) {
  if (admitted < 1) return null;
  const layouts = [
    {
      key: "narrow",
      columns: Math.ceil(admitted / 2),
      className: "mx-auto h-auto w-(--row-narrow) max-w-full md:hidden",
    },
    {
      key: "wide",
      columns: admitted,
      className: "mx-auto hidden h-auto w-(--row-wide) max-w-full md:block",
    },
  ];
  return (
    <div className="text-highlight">
      {layouts.map(({ key, columns, className }) => {
        const rows = Math.ceil(admitted / columns);
        return (
          <svg
            key={key}
            aria-hidden="true"
            focusable="false"
            viewBox={`0 0 ${columns * MARK_PITCH} ${rows * MARK_PITCH}`}
            className={className}
            style={
              {
                // The field's pitch: about 0.55rem on phones, 0.75rem wide.
                "--row-narrow": `${columns * 0.55}rem`,
                "--row-wide": `${columns * 0.75}rem`,
                ...litStep(admitted),
              } as CSSProperties
            }
          >
            {Array.from({ length: admitted }, (_, index) => (
              <circle
                // biome-ignore lint/suspicious/noArrayIndexKey: marks are identical and never reorder.
                key={index}
                className="selection-field-lit"
                cx={(index % columns) * MARK_PITCH + MARK_PITCH / 2}
                cy={Math.floor(index / columns) * MARK_PITCH + MARK_PITCH / 2}
                r={MARK_RADIUS}
                fill="currentColor"
                style={{ "--lit-order": index } as CSSProperties}
              />
            ))}
          </svg>
        );
      })}
    </div>
  );
}
