import { Container, Eyebrow, Reveal, Section } from "@/components/ds";
import { cn } from "@/lib/cn";
import {
  type JourneyStep,
  journeySteps,
  memberJourney,
  stepAnchor,
} from "./data/member-journey";
import { JourneyProgress } from "./journey-progress";

const SECTION_ID = "journey";

/**
 * The member journey as a path. A violet rail fills as the reader scrolls;
 * at stage 02 it forks into two parallel tracks (with an "OR" node on the
 * branch) and merges again. Markers light up as they cross the reading line,
 * and a sticky index on wide screens tracks the current stage.
 *
 * Server markup; the `JourneyProgress` island drives the fill, the markers
 * and the index state through the `data-*` hooks below.
 */
export function JourneySection() {
  return (
    <Section
      tone="paper"
      spacing="lg"
      id={SECTION_ID}
      aria-labelledby="journey-title"
    >
      <Container>
        <div className="grid gap-14 md:gap-16 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] xl:gap-20 2xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] 2xl:gap-24">
          <JourneyIndex />
          <ol className="relative">
            {memberJourney.map((stage, index) =>
              stage.kind === "single" ? (
                <SingleStage
                  key={stage.step.step}
                  step={stage.step}
                  stageIndex={index}
                  isLast={index === memberJourney.length - 1}
                />
              ) : (
                <ForkStage
                  key={stage.steps[0].step}
                  steps={stage.steps}
                  stageIndex={index}
                />
              ),
            )}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/** Sticky side index: section label, stage counter and jump links. */
function JourneyIndex() {
  return (
    <div className="xl:sticky xl:top-[calc(var(--header-height)+3.5rem)] xl:self-start xl:pt-[1.0625rem]">
      <h2 id="journey-title">
        <Eyebrow as="span">Member Journey</Eyebrow>
      </h2>
      <div className="hidden xl:block">
        <JourneyProgress
          rootId={SECTION_ID}
          stageCount={memberJourney.length}
        />
        <nav aria-label="Member journey stages" className="mt-10">
          <ol className="border-hairline border-l">
            {journeySteps.map((step) => (
              <li key={step.step}>
                <a
                  href={`#${stepAnchor(step.step)}`}
                  data-journey-link=""
                  data-stage={step.stageIndex}
                  data-state={step.stageIndex === 0 ? "current" : "next"}
                  className="group/index relative -ml-px flex items-baseline gap-4 py-2 pl-5 text-fg-subtle text-small transition-[color] duration-300 ease-brand hover:text-fg data-[state=current]:text-fg data-[state=done]:text-fg-muted motion-reduce:transition-none"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-0.5 origin-center scale-y-0 rounded-full bg-violet-500 transition-[scale,opacity] duration-500 ease-brand group-data-[state=current]/index:scale-y-100 group-data-[state=done]/index:scale-y-100 group-data-[state=done]/index:opacity-30 motion-reduce:transition-none"
                  />
                  <span className="tabular w-8 shrink-0 text-meta">
                    {step.step}
                  </span>
                  <span className="font-medium">{step.name}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

/** Vertical rail segment; the island scales its violet fill. */
function Track({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-track=""
      className={cn(
        "pointer-events-none absolute w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-hairline-strong",
        className,
      )}
    >
      <span
        data-fill=""
        className="block size-full origin-top bg-gradient-to-b from-violet-400 to-violet-600 [transform:scaleY(0)]"
      />
    </span>
  );
}

/**
 * Curved branch between the main rail and the second lane (md and up).
 * Rendered twice: a hairline base and a violet copy that fades in.
 */
function Connector({ shape }: { shape: string }) {
  const base =
    "pointer-events-none absolute left-[calc(1.5rem_-_1px)] hidden w-[calc(50%_+_var(--fork-gap)/2_+_2px)] md:block";
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(base, shape, "border-hairline-strong")}
      />
      <span
        aria-hidden="true"
        data-connector=""
        className={cn(base, shape, "border-violet-500 opacity-0")}
      />
    </>
  );
}

function Marker({
  step,
  stageIndex,
}: {
  step: JourneyStep;
  stageIndex: number;
}) {
  const Icon = step.icon;
  return (
    <span
      aria-hidden="true"
      data-marker=""
      data-stage={stageIndex}
      className="absolute top-0 left-0 z-10 grid size-12 place-items-center rounded-full border border-hairline-strong bg-canvas text-fg-subtle transition-[background-color,border-color,color,box-shadow] duration-700 ease-brand data-lit:border-violet-600 data-lit:bg-violet-600 data-lit:text-white data-lit:shadow-halo motion-reduce:transition-none"
    >
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}

function OrNode({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-marker=""
      className={cn(
        "absolute z-10 grid h-8 min-w-12 place-items-center rounded-full border border-hairline-strong bg-canvas px-3 text-eyebrow text-fg-subtle transition-[border-color,color,box-shadow] duration-700 ease-brand data-lit:border-violet-500 data-lit:text-highlight data-lit:shadow-halo motion-reduce:transition-none",
        className,
      )}
    >
      OR
    </span>
  );
}

function StepContent({
  step,
  compact = false,
}: {
  step: JourneyStep;
  /** Narrower column (the fork): slightly smaller title on tablets. */
  compact?: boolean;
}) {
  return (
    <Reveal className="pt-[1.0625rem]">
      <p className="tabular text-eyebrow text-highlight">{step.step}</p>
      <h3
        className={cn(
          "mt-3 text-fg text-heading-lg",
          compact && "md:text-heading-md xl:text-heading-lg",
        )}
      >
        {step.name}
      </h3>
      <p className="mt-4 max-w-2xl text-body text-fg-muted">
        {step.description}
      </p>
    </Reveal>
  );
}

function SingleStage({
  step,
  stageIndex,
  isLast,
}: {
  step: JourneyStep;
  stageIndex: number;
  isLast: boolean;
}) {
  return (
    <li
      id={stepAnchor(step.step)}
      className={cn(
        "relative scroll-mt-header pl-18 md:pl-20",
        !isLast && "pb-16 md:pb-24",
      )}
    >
      {isLast ? null : <Track className="top-6 bottom-0 left-6" />}
      <Marker step={step} stageIndex={stageIndex} />
      <StepContent step={step} />
    </li>
  );
}

/**
 * Two parallel tracks. On md and up the rail branches into a second lane
 * (the "OR" node sits on the branch) and merges back below; on small screens
 * both steps sit on the main rail with the "OR" node between them.
 */
function ForkStage({
  steps,
  stageIndex,
}: {
  steps: [JourneyStep, JourneyStep];
  stageIndex: number;
}) {
  const [first, second] = steps;
  return (
    <li className="relative pb-16 [--fork-gap:2.5rem] md:pt-16 md:pb-24 lg:[--fork-gap:3rem]">
      <Track className="top-0 bottom-0 left-6" />
      <Connector shape="top-0 h-16 rounded-tr-[1.75rem] border-t-2 border-r-2" />
      <Connector shape="bottom-0 h-24 rounded-br-[1.75rem] border-r-2 border-b-2" />
      <Track className="top-[5.5rem] bottom-24 left-[calc(50%_+_var(--fork-gap)/2_+_1.5rem)] hidden md:block" />
      <OrNode className="top-0 left-[calc(1.5rem_+_(50%_+_var(--fork-gap)/2)/2)] hidden -translate-x-1/2 -translate-y-1/2 md:grid" />

      <div className="grid md:grid-cols-2 md:gap-x-(--fork-gap)">
        <div
          id={stepAnchor(first.step)}
          className="relative scroll-mt-header pl-18 md:pl-20"
        >
          <Marker step={first} stageIndex={stageIndex} />
          <StepContent step={first} compact />
        </div>
        <div className="relative h-24 md:hidden">
          <OrNode className="top-1/2 left-6 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="sr-only">or</p>
        <div
          id={stepAnchor(second.step)}
          className="relative scroll-mt-header pl-18 md:pl-20"
        >
          <Marker step={second} stageIndex={stageIndex} />
          <StepContent step={second} compact />
        </div>
      </div>
    </li>
  );
}
