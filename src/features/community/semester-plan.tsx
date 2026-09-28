import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import { cn } from "@/lib/cn";
import {
  type JourneyStep,
  memberJourney,
  semesterColumns,
  stepAnchor,
} from "./data/member-journey";
import { stories } from "./data/member-stories";

const SECTION_ID = "journey";

/**
 * Two columns from lg: the step's copy (5 parts) and the timetable (7 parts),
 * with a 3rem gap. The column rules behind the rows are placed from the same
 * numbers, so they meet the header numerals and the row markers exactly.
 */
const ROW_GRID =
  "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-12";
const RAIL_WIDTH = "w-[calc((100%-3rem)*7/12)]";

/**
 * Horizontal position of a semester's column rule within a row, from the
 * ROW_GRID numbers: past the copy column and the gap, then that share of the
 * timetable.
 */
const columnLeft = (semester: number) =>
  `calc((100% - 3rem) * 5 / 12 + 3rem + (100% - 3rem) * 7 / 12 * ${semester} / ${semesterColumns.length})`;

/**
 * Vertical centre of a row's marker from the row's top: the row's lg top
 * padding (lg:py-14) plus half the rule's height (h-10).
 */
const MARKER_TOP = "4.75rem";

/** One grid track per timetable column, so the columns follow the data. */
const COLUMNS: CSSProperties = {
  gridTemplateColumns: `repeat(${semesterColumns.length}, minmax(0, 1fr))`,
};

/** Places an element from a step's opening semester to the last column. */
const fromColumn = (step: JourneyStep): CSSProperties => ({
  gridColumn: `${step.fromSemester + 1} / -1`,
});

/** "At the start", "From semester 2": the timetable's cell, in words. */
const opensIn = (step: JourneyStep) =>
  step.fromSemester === 0
    ? "Once, at the start"
    : `From semester ${step.fromSemester}`;

/**
 * The member journey as a membership timetable: one row per step, set
 * against columns for the recruiting round (0) and the semesters after it.
 * Each row's rule starts in the semester the step opens and runs on; the
 * onboarding weekend is a single point. A member's own words hang on the
 * rows they took. Server markup only: the rules draw in with `Reveal`.
 */
export function SemesterPlan() {
  return (
    <Section
      tone="paper"
      spacing="lg"
      id={SECTION_ID}
      aria-labelledby="journey-title"
    >
      <Container>
        <SectionHeader
          id="journey-title"
          title="Semester by semester"
          size="lg"
          layout="stack"
          lead="Every member starts at the onboarding weekend. The rows below show when each step of the membership opens, counted in semesters."
        />
        <div className="relative">
          <ColumnRules />
          <ColumnHeads />
          <ol className="border-hairline-strong border-t lg:border-t-0">
            {memberJourney.map((stage) =>
              stage.kind === "single" ? (
                <li key={stage.step.step} className="border-hairline border-b">
                  <StepRow step={stage.step} />
                </li>
              ) : (
                <li
                  key={stage.steps[0].step}
                  className="border-hairline border-b"
                >
                  <StepRow step={stage.steps[0]} connect="down" />
                  <ForkDivider step={stage.steps[0]} />
                  <StepRow step={stage.steps[1]} connect="up" />
                </li>
              ),
            )}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/** Hairline column rules behind the timetable (lg and up). */
function ColumnRules() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 hidden lg:grid",
        RAIL_WIDTH,
      )}
      style={COLUMNS}
    >
      {semesterColumns.map((label) => (
        <span key={label} className="border-hairline border-l" />
      ))}
    </div>
  );
}

/** The semester numerals over the columns (lg and up). */
function ColumnHeads() {
  return (
    <div
      aria-hidden="true"
      className={cn("hidden border-hairline-strong border-b pb-8", ROW_GRID)}
    >
      <p className="self-end text-fg-subtle text-meta">Semester</p>
      <div className="grid" style={COLUMNS}>
        {semesterColumns.map((label, index) => (
          <div key={label} className="pl-5">
            <span className="tabular block text-display-lg text-highlight">
              {label}
            </span>
            {index === 0 ? (
              <span className="mt-3 block text-fg-subtle text-meta">
                Recruiting round
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One step: its copy, where it sits in the timetable, and its evidence. */
function StepRow({
  step,
  connect,
}: {
  step: JourneyStep;
  /**
   * In a fork: draw the tracks' shared connector from this row's marker
   * down to the row's end (the first track) or from its top (the second).
   */
  connect?: "down" | "up";
}) {
  const story = step.evidence
    ? stories.find((entry) => entry.name === step.evidence?.name)
    : undefined;
  return (
    <div
      id={stepAnchor(step.step)}
      className={cn("relative scroll-mt-header py-10 lg:py-14", ROW_GRID)}
    >
      {connect ? (
        <span
          aria-hidden="true"
          className="absolute z-20 hidden w-0.5 -translate-x-1/2 bg-highlight lg:block"
          style={{
            left: columnLeft(step.fromSemester),
            ...(connect === "down"
              ? { top: MARKER_TOP, bottom: 0 }
              : { top: 0, height: MARKER_TOP }),
          }}
        />
      ) : null}
      <div>
        <h3 className="text-fg text-heading-lg">{step.name}</h3>
        <div className="mt-2 flex items-center gap-4">
          <p className="text-fg-subtle text-meta">{opensIn(step)}</p>
          <SemesterStrip step={step} />
        </div>
        <p className="mt-4 max-w-xl text-body text-fg-muted">
          {step.description}
        </p>
      </div>
      <div className="lg:grid lg:content-start" style={COLUMNS}>
        <Rule step={step} />
        {step.evidence && story ? (
          <figure
            className="relative z-10 mt-8 max-w-md lg:mt-4 lg:ml-px lg:bg-canvas lg:py-2 lg:pr-6 lg:pl-5"
            style={fromColumn(step)}
          >
            <blockquote className="text-body text-fg">
              <p>“{step.evidence.excerpt}”</p>
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <Image
                src={story.image}
                alt=""
                width={40}
                height={40}
                className="size-9 shrink-0 rounded-full object-cover"
              />
              <span className="text-fg-muted text-meta">
                <span className="font-medium text-fg">{story.name}</span>,{" "}
                {story.role}
              </span>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The row's mark in the timetable (lg and up): a dot on the rule of the
 * semester the step opens in and, for ongoing steps, a line to the edge.
 */
function Rule({ step }: { step: JourneyStep }) {
  return (
    <div
      aria-hidden="true"
      className="relative hidden h-10 lg:block"
      style={fromColumn(step)}
    >
      <span className="absolute top-1/2 left-0 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-highlight ring-4 ring-canvas" />
      {step.span === "ongoing" ? (
        <Reveal
          variant="line"
          delay={step.fromSemester * 120}
          className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center"
        >
          <span className="h-0.5 flex-1 bg-highlight" />
          <ArrowRight
            className="-ml-1.5 size-4 shrink-0 text-highlight"
            strokeWidth={2}
          />
        </Reveal>
      ) : null}
    </div>
  );
}

/**
 * The timetable row in miniature, beside the words, for screens without the
 * columns: one cell per semester, the opening one marked and the rest of the
 * run drawn.
 */
function SemesterStrip({ step }: { step: JourneyStep }) {
  return (
    <div aria-hidden="true" className="grid h-3 w-24 lg:hidden" style={COLUMNS}>
      {semesterColumns.map((label, index) => {
        const opens = index === step.fromSemester;
        const runs = step.span === "ongoing" && index > step.fromSemester;
        return (
          <span
            key={label}
            className="relative border-hairline-strong border-l"
          >
            {opens ? (
              <span className="absolute top-1/2 left-0 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-highlight" />
            ) : null}
            {(opens && step.span === "ongoing") || runs ? (
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-highlight" />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

/**
 * "or" between the two tracks of a fork. From lg it sits beside the violet
 * connector that joins both tracks' markers on the semester they open in.
 */
function ForkDivider({ step }: { step: JourneyStep }) {
  return (
    <div className="relative lg:py-2">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 hidden w-0.5 -translate-x-1/2 bg-highlight lg:block"
        style={{ left: columnLeft(step.fromSemester) }}
      />
      <p
        className="flex items-center gap-3 text-fg-subtle text-meta lg:absolute lg:top-1/2 lg:ml-4 lg:block lg:-translate-y-1/2"
        style={{ left: columnLeft(step.fromSemester) }}
      >
        <span
          aria-hidden="true"
          className="h-px w-6 bg-hairline-strong lg:hidden"
        />
        or
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-hairline lg:hidden"
        />
      </p>
    </div>
  );
}
