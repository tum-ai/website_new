import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import { eLabConfig } from "@/config/e-lab";
import { cn } from "@/lib/cn";
import {
  type Gate,
  gates,
  type Phase,
  scaleTicks,
  selectionStages,
} from "./data/selection";

/** Tick spacing of the scale, in teams. */
const TICK_STEP = 100;

/**
 * Two columns from lg: the gate's words (4 parts) and the scale (8 parts).
 * Every bar starts on the scale's left edge, the axis, which runs unbroken
 * through all rows (each row's scale cell draws its stretch and rows carry
 * no vertical padding), so the bars' lengths compare directly and the phases
 * sit on the teams' way from one gate to the next.
 */
const ROW_GRID = "lg:grid lg:grid-cols-12 lg:gap-x-12";
const WORDS = "lg:col-span-4";
const SCALE = "lg:col-span-8";
/** The axis: the scale column's left edge, from lg. */
const AXIS = "lg:border-hairline-strong lg:border-l";

/**
 * "The gates", the page's bold element: one cohort from the application
 * round to the Final Pitch. Each gate's bar is its teams as a share of all
 * applications, drawn to scale on one axis with a tick scale above; the
 * program phases sit between the gates. Server markup only: the bars draw
 * in once with `Reveal`.
 */
export function SelectionGates() {
  return (
    <Section
      tone="paper"
      spacing="lg"
      id="gates"
      aria-labelledby="gates-title"
      className="scroll-mt-header"
    >
      <Container>
        <SectionHeader
          id="gates-title"
          title="Every team passes the same gates."
          size="lg"
          layout="stack"
          lead="Each bar is drawn to scale: the teams that reach a gate, out of every team that applied. Between the gates, you build."
        />
        <Scale />
        <ol>
          {selectionStages.map((stage) =>
            stage.kind === "gate" ? (
              <GateRow
                key={stage.id}
                gate={stage}
                index={gates.indexOf(stage)}
              />
            ) : (
              <PhaseRow key={stage.id} phase={stage} />
            ),
          )}
        </ol>
      </Container>
    </Section>
  );
}

/** The tick scale over the bars, in teams. Decorative: each gate states its figure. */
function Scale() {
  const ticks = scaleTicks(eLabConfig.selection.applications, TICK_STEP);
  return (
    <div aria-hidden="true" className={cn("pb-3", ROW_GRID)}>
      <p
        className={cn(
          "hidden self-end text-fg-subtle text-meta lg:block",
          WORDS,
        )}
      >
        Teams
      </p>
      <div className={cn("relative h-6", SCALE)}>
        {ticks.map((tick, index) => (
          <span
            key={tick.teams}
            className={cn(
              "tabular absolute top-0 text-fg-subtle text-meta",
              index === 0
                ? "translate-x-0"
                : index === ticks.length - 1 && tick.at === 1
                  ? "-translate-x-full"
                  : "-translate-x-1/2",
            )}
            style={{ left: `${tick.at * 100}%` }}
          >
            {tick.teams}
          </span>
        ))}
        {ticks.map((tick) => (
          <span
            key={`mark-${tick.teams}`}
            className="absolute bottom-0 h-1.5 w-px bg-hairline-strong"
            style={{ left: `${tick.at * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** A gate: its name and what happens there, its figure and its bar. */
function GateRow({ gate, index }: { gate: Gate; index: number }) {
  return (
    <li
      className={cn("border-hairline-strong border-t py-8 lg:py-0", ROW_GRID)}
    >
      <div className={cn("lg:py-10", WORDS)}>
        <h3 className="text-fg text-heading-lg">{gate.name}</h3>
        <p className="mt-3 max-w-md text-body text-fg-muted">
          {gate.description}
        </p>
      </div>
      <div className={cn("mt-6 lg:mt-0 lg:py-10", AXIS, SCALE)}>
        <p className="flex items-baseline gap-3 lg:pl-6">
          <span className="tabular text-fg text-stat-lg">
            {gate.approximate ? (
              <>
                <span aria-hidden="true">~</span>
                <span className="sr-only">about </span>
              </>
            ) : null}
            {gate.teams}
          </span>
          <span className="text-fg-muted text-small">
            {gate.id === "applications" ? "team applications" : "teams"}
          </span>
        </p>
        <div
          aria-hidden="true"
          className="relative mt-5 h-3 border-hairline-strong border-l lg:border-l-0"
        >
          <span className="absolute inset-x-0 top-1/2 h-px bg-hairline" />
          <Reveal
            variant="line"
            delay={index * 120}
            className="absolute inset-y-0 left-0 bg-highlight"
            style={{ width: `${gate.share * 100}%` }}
          />
        </div>
      </div>
    </li>
  );
}

/**
 * A program phase between two gates: how long it runs and what teams do. From
 * lg it sits on the axis, in the scale column, since it is time the teams
 * spend between two gates rather than a gate of its own.
 */
function PhaseRow({ phase }: { phase: Phase }) {
  return (
    <li className={cn("pb-8 lg:pb-0", ROW_GRID)}>
      <div
        className={cn(
          "border-hairline-strong border-l-2 pl-5 lg:col-start-5 lg:border-l lg:pt-2 lg:pb-6 lg:pl-6",
          SCALE,
        )}
      >
        <p className="font-semibold text-highlight text-small">
          {phase.duration}
        </p>
        <h3 className="mt-1 text-fg text-heading-sm">{phase.name}</h3>
        <p className="mt-2 max-w-lg text-fg-muted text-small">
          {phase.description}
        </p>
      </div>
    </li>
  );
}
