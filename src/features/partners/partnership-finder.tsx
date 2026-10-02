"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FlaskConical,
  type LucideIcon,
  Megaphone,
  RotateCcw,
  Users,
  Zap,
} from "lucide-react";
import {
  type CSSProperties,
  Fragment,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button, Highlight, IconBadge, Text } from "@/components/ds";
import { prefersReducedMotion } from "@/components/ds/internal";
import { cn } from "@/lib/cn";
import { splitAtPageToken } from "@/lib/content-copy";
import { ContactActions } from "./contact-actions";
import { usePartnership } from "./partnership-context";
import { getPartnershipRecommendation } from "./partnerships";

const icons = {
  talent: Users,
  hackathon: Zap,
  brand: Megaphone,
  research: FlaskConical,
};

const steps = ["Your goal", "Your timeframe", "Your fit"];

/*
 * The step transition's timing (partners.css holds the matching CSS): the
 * old step fades for LEAVE_MS, then the new one rises in; its last part
 * starts three 50ms steps late, so ENTER_MS covers 520ms plus the stagger.
 */
const LEAVE_MS = 180;
const ENTER_MS = 700;

type Phase = "idle" | "leaving" | "entering";

/* Step headings receive focus programmatically; the panel scrolls below the fixed header. */
const stepHeading =
  "scroll-mt-header text-balance text-heading-lg text-fg outline-none focus-visible:outline-none";
const stepLabel = "flex items-center gap-2 text-eyebrow text-highlight";

/** Props for one staggered part of a step: its entrance class and order. */
function part(order: number, className?: string) {
  return {
    className: cn("finder-step-part", className),
    style: { "--step-order": order } as CSSProperties,
  };
}

function FinderOption({
  icon,
  label,
  detail,
  onSelect,
  order,
  className,
}: {
  icon?: LucideIcon;
  label: ReactNode;
  detail: ReactNode;
  onSelect: () => void;
  order: number;
  className?: string;
}) {
  const { className: partClass, style } = part(order);
  return (
    <Button
      variant={null}
      size={null}
      onClick={onSelect}
      style={style}
      className={cn(
        partClass,
        "w-full justify-start gap-3.5 whitespace-normal rounded-2xl border border-hairline bg-canvas p-4 text-left font-normal text-fg tracking-normal hover:border-violet-500/40 hover:bg-violet-50/70 motion-safe:active:scale-[0.995] sm:gap-4 md:px-5",
        className,
      )}
    >
      {icon ? (
        <IconBadge
          icon={icon}
          size="sm"
          className="transition-colors duration-300 ease-brand group-hover/button:bg-violet-500/20"
        />
      ) : null}
      <span className="min-w-0 flex-1">
        <strong className="block font-semibold text-body text-fg">
          {label}
        </strong>
        <small className="mt-0.5 block text-fg-muted text-small">
          {detail}
        </small>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 text-fg-subtle transition-[color,translate] duration-500 ease-brand group-hover/button:translate-x-0.5 group-hover/button:text-highlight motion-reduce:transition-none"
      />
    </Button>
  );
}

/**
 * The result question with every `{{format}}` (or `{{ format }}`, as the
 * Studio allows) replaced by `format`, the highlighted format name; without
 * the token, the text alone.
 */
function withFormat(template: string, format: ReactNode): ReactNode {
  const parts = splitAtPageToken(template, "format");
  if (parts.length === 1) return template;
  return parts.map((part, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: the parts are static and may repeat; their position is their identity.
    <Fragment key={index}>
      {index > 0 ? format : null}
      {part}
    </Fragment>
  ));
}

/**
 * The partnership finder's panel: two questions (goal, then timeframe) lead
 * to a recommended format with the contact actions, which carry the answers
 * into the email and the booking notes. Needs a PartnershipProvider.
 *
 * The progress follows each answer at once; the content lags behind it
 * (`shownStep`): the old step fades out, inert, then the new one rises in
 * while the panel glides to its height, focus moves to its heading and, only
 * if the panel's top has left the view, the page scrolls back to it. Under
 * reduced motion the swap is immediate.
 */
export function PartnershipFinder() {
  const { selection, dispatch, copy } = usePartnership();
  const { step } = selection;
  // The answers the content shows: the leaving step keeps its own (Back and
  // Start again clear them) until it has faded.
  const [shown, setShown] = useState(selection);
  const [phase, setPhase] = useState<Phase>("idle");
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const previousShownStep = useRef(shown.step);
  const shownStep = shown.step;
  const { intent } = shown;
  const recommendation = getPartnershipRecommendation(shown, copy);
  const selectedIntent = copy.intents.find((item) => item.id === intent);
  const activeIndex = step === "intent" ? 0 : step === "duration" ? 1 : 2;

  // The stage holds its content's height explicitly, so a step change can
  // transition it (partners.css); resizes follow before the next paint.
  useLayoutEffect(() => {
    const box = stage.current;
    const inner = content.current;
    if (!box || !inner) return;
    const match = () => {
      box.style.height = `${inner.offsetHeight}px`;
    };
    match();
    const observer = new ResizeObserver(match);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (selection === shown) return;
    if (prefersReducedMotion()) {
      setShown(selection);
      setPhase("idle");
      return;
    }
    setPhase("leaving");
    const timer = window.setTimeout(() => {
      setShown(selection);
      setPhase("entering");
    }, LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [selection, shown]);

  useEffect(() => {
    if (previousShownStep.current === shownStep) return;
    previousShownStep.current = shownStep;
    heading.current?.focus({ preventScroll: true });
    const box = panel.current;
    if (box) {
      const offset = Number.parseFloat(getComputedStyle(box).scrollMarginTop);
      if (box.getBoundingClientRect().top < (offset || 0)) {
        box.scrollIntoView({
          block: "start",
          behavior: prefersReducedMotion() ? "instant" : "smooth",
        });
      }
    }
    const timer = window.setTimeout(() => setPhase("idle"), ENTER_MS);
    return () => window.clearTimeout(timer);
  }, [shownStep]);

  return (
    <div
      ref={panel}
      data-tone="paper"
      className="scroll-mt-header rounded-4xl border border-hairline p-5 shadow-soft sm:p-7 md:p-9"
    >
      <ol
        className="grid grid-cols-3 gap-3 sm:gap-4"
        aria-label="Partnership finder progress"
      >
        {steps.map((label, index) => {
          const current = index === activeIndex;
          const complete = index < activeIndex;
          return (
            <li
              key={label}
              aria-current={current ? "step" : undefined}
              data-complete={complete}
              className="min-w-0"
            >
              <span
                className={cn(
                  "flex items-center gap-2 text-meta transition-colors duration-500 ease-brand motion-reduce:transition-none",
                  current
                    ? "font-semibold text-fg"
                    : complete
                      ? "text-fg-muted"
                      : "text-fg-subtle",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full font-semibold text-eyebrow tracking-normal transition-[background-color,color,box-shadow] duration-500 ease-brand motion-reduce:transition-none",
                    current
                      ? "bg-violet-950 text-white"
                      : complete
                        ? "bg-violet-500/12 text-highlight"
                        : "ring-1 ring-hairline-strong ring-inset",
                  )}
                >
                  {complete ? (
                    <Check aria-hidden className="size-3" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>
                {/* Phones show every number but only the current label. */}
                <span
                  className={cn(
                    "truncate",
                    current ? undefined : "max-sm:sr-only",
                  )}
                >
                  {label}
                </span>
              </span>
              <span
                aria-hidden
                className="mt-3 block h-0.5 overflow-hidden rounded-full bg-hairline"
              >
                <span
                  className={cn(
                    "block h-full origin-left rounded-full bg-violet-500 transition-transform duration-700 ease-brand motion-reduce:transition-none",
                    index <= activeIndex ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
            </li>
          );
        })}
      </ol>
      <div
        ref={stage}
        data-phase={phase}
        inert={phase === "leaving"}
        className="finder-stage"
      >
        <div ref={content} className="finder-step pt-7 md:pt-8">
          {shownStep !== "intent" ? (
            <Button
              variant="ghost"
              size="sm"
              {...part(0, "-mt-2 mb-3 -ml-4 text-fg-muted hover:text-fg")}
              onClick={() => dispatch({ type: "back" })}
            >
              <ArrowLeft
                aria-hidden
                className="size-4 transition-transform duration-500 ease-brand group-hover/button:-translate-x-0.5 motion-reduce:transition-none"
              />
              Back
            </Button>
          ) : null}
          {shownStep === "intent" ? (
            <>
              <h3 ref={heading} tabIndex={-1} {...part(0, stepHeading)}>
                {copy.prompts.intentQuestion}
              </h3>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {copy.intents.map((item, index) => (
                  <FinderOption
                    key={item.id}
                    order={index + 1}
                    icon={icons[item.id]}
                    label={item.label}
                    detail={item.detail}
                    onSelect={() =>
                      dispatch({ type: "intent", intent: item.id })
                    }
                  />
                ))}
              </div>
            </>
          ) : shownStep === "duration" ? (
            <>
              <p {...part(0, cn(stepLabel, "mb-3"))}>{selectedIntent?.label}</p>
              <h3 ref={heading} tabIndex={-1} {...part(0, stepHeading)}>
                {copy.prompts.durationQuestion}
              </h3>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {copy.durations.map((item, index) => (
                  <FinderOption
                    key={item.id}
                    order={index + 1}
                    label={item.label}
                    detail={item.detail}
                    className="min-h-22"
                    onSelect={() =>
                      dispatch({ type: "duration", duration: item.id })
                    }
                  />
                ))}
              </div>
            </>
          ) : recommendation ? (
            <div>
              <span {...part(0, cn(stepLabel, "mb-3"))}>
                <Check aria-hidden className="size-4" />
                {selectedIntent?.label}
              </span>
              <h3 ref={heading} tabIndex={-1} {...part(0, stepHeading)}>
                {withFormat(
                  copy.prompts.resultQuestion,
                  <Highlight>{recommendation.name}</Highlight>,
                )}
              </h3>
              <Text {...part(1, "mt-5")}>{recommendation.description}</Text>
              {intent === "hackathon" && shown.duration === "ongoing" ? (
                <p {...part(1, "mt-4 font-semibold text-body text-highlight")}>
                  {copy.prompts.firstChoice}
                </p>
              ) : null}
              <div {...part(2)}>
                <ContactActions className="mt-7 max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                {...part(3, "mt-4 -ml-4 text-fg-muted hover:text-fg")}
                onClick={() => dispatch({ type: "reset" })}
              >
                <RotateCcw
                  aria-hidden
                  className="size-3.5 transition-transform duration-500 ease-brand group-hover/button:-rotate-45 motion-reduce:transition-none"
                />
                Start again
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
