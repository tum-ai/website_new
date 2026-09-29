import type { CSSProperties } from "react";
import { LIT_RADIUS, MARK_PITCH } from "../selection-field";

/**
 * The admitted of one round as lit marks in a row, at the selection field's
 * scale: the field's answer in the closing band. One row from `md` up, two
 * below. Decorative; it lights up left to right with the field's entrance
 * when its Reveal enters.
 */
export function BatchRow({ admitted }: { admitted: number }) {
  const layouts = [
    { columns: Math.ceil(admitted / 2), className: "h-auto w-full md:hidden" },
    { columns: admitted, className: "hidden h-auto w-full md:block" },
  ];
  return (
    <div className="mx-auto max-w-2xl text-highlight">
      {layouts.map(({ columns, className }) => {
        const rows = Math.ceil(admitted / columns);
        return (
          <svg
            key={columns}
            aria-hidden="true"
            focusable="false"
            viewBox={`0 0 ${columns * MARK_PITCH} ${rows * MARK_PITCH}`}
            className={className}
          >
            {Array.from({ length: admitted }, (_, index) => (
              <circle
                // biome-ignore lint/suspicious/noArrayIndexKey: marks are identical and never reorder.
                key={index}
                className="selection-field-lit"
                cx={(index % columns) * MARK_PITCH + MARK_PITCH / 2}
                cy={Math.floor(index / columns) * MARK_PITCH + MARK_PITCH / 2}
                r={LIT_RADIUS}
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
