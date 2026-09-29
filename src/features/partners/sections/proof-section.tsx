import type { CSSProperties } from "react";
import { Container, Ledger, Reveal, Section } from "@/components/ds";
import type { PartnerStat, PartnersSections } from "../data/partners";
import {
  LIT_RADIUS,
  MARK_RADIUS,
  MARK_PITCH as PITCH,
  type SelectionField,
  selectionField,
} from "../selection-field";

/**
 * Columns of the two layouts: 70 fills the wide column in 30 rows, 42 the
 * phone width in 50 (for 2100 marks; other counts end in a short row).
 */
const WIDE_COLUMNS = 70;
const NARROW_COLUMNS = 42;

/** The recruiting round the field draws, from the render's site facts. */
export type SelectionFacts = {
  startedApplications: number;
  acceptanceRatePercent: number;
  admitted: number;
};

/**
 * One layout of the field. The resting marks are one pattern fill clipped to
 * the exact count (full rows, then the short last row), so the markup stays
 * small; the admitted marks are drawn over them one by one and light up in
 * the order the sequence placed them.
 */
function FieldArtwork({
  field,
  patternId,
  className,
}: {
  field: SelectionField;
  patternId: string;
  className?: string;
}) {
  const width = field.columns * PITCH;
  const fullRows =
    field.lastRow === field.columns ? field.rows : field.rows - 1;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${field.rows * PITCH}`}
      className={className}
    >
      <defs>
        <pattern
          id={patternId}
          width={PITCH}
          height={PITCH}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={PITCH / 2}
            cy={PITCH / 2}
            r={MARK_RADIUS}
            fill="currentColor"
          />
        </pattern>
      </defs>
      <g className="selection-field-rest">
        <rect
          width={width}
          height={fullRows * PITCH}
          fill={`url(#${patternId})`}
        />
        {fullRows < field.rows ? (
          <rect
            y={fullRows * PITCH}
            width={field.lastRow * PITCH}
            height={PITCH}
            fill={`url(#${patternId})`}
          />
        ) : null}
      </g>
      <g className="text-highlight">
        {field.lit.map(({ column, row }, order) => (
          <circle
            key={`${column}:${row}`}
            className="selection-field-lit"
            cx={column * PITCH + PITCH / 2}
            cy={row * PITCH + PITCH / 2}
            r={LIT_RADIUS}
            fill="currentColor"
            style={{ "--lit-order": order } as CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * The proof band on night: the selection figures beside the recruiting
 * round drawn to the exact count, one mark per started application with
 * the admitted share lit. The drawing is decorative; its caption says the
 * same in words, and the ledger holds the figures.
 */
export function ProofSection({
  stats,
  selection,
  copy,
}: {
  stats: readonly PartnerStat[];
  selection: SelectionFacts;
  copy: PartnersSections["proof"];
}) {
  const marks = selection.startedApplications;
  const wide = selectionField({
    marks,
    lit: selection.admitted,
    columns: WIDE_COLUMNS,
  });
  const narrow = selectionField({
    marks,
    lit: selection.admitted,
    columns: NARROW_COLUMNS,
  });
  return (
    <Section tone="night" spacing="lg" aria-labelledby="partner-proof-title">
      <Container>
        <Reveal>
          <h2
            id="partner-proof-title"
            className="max-w-[12em] text-display-md text-fg"
          >
            {copy.title}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:items-end lg:gap-x-12">
          <Reveal as="figure" variant="fade" className="lg:col-span-8">
            <div className="text-fg/25">
              <FieldArtwork
                field={narrow}
                patternId="selection-marks-narrow"
                className="h-auto w-full md:hidden"
              />
              <FieldArtwork
                field={wide}
                patternId="selection-marks-wide"
                className="hidden h-auto w-full md:block"
              />
            </div>
            <figcaption className="mt-6 max-w-lg text-fg-muted text-small">
              One recruiting round, drawn to the count:{" "}
              {marks.toLocaleString("en")} started applications, one mark each.
              The {selection.admitted} lit marks are the{" "}
              {selection.acceptanceRatePercent}% who become members.
            </figcaption>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-4">
            <Ledger
              items={stats.map((stat) => ({
                value: stat.value,
                count: true,
                label: stat.label,
                note: stat.detail,
              }))}
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
