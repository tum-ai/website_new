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
import { type ReactNode, useEffect, useRef } from "react";
import { Button, Highlight, IconBadge, Text } from "@/components/ds";
import { cn } from "@/lib/cn";
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

/* Step headings receive focus programmatically; the panel scrolls below the fixed header. */
const stepHeading =
  "scroll-mt-header text-heading-lg text-fg outline-none focus-visible:outline-none";
const stepLabel = "flex items-center gap-2 text-eyebrow text-highlight";

function FinderOption({
  icon,
  label,
  detail,
  onSelect,
  className,
}: {
  icon?: LucideIcon;
  label: ReactNode;
  detail: ReactNode;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <Button
      variant={null}
      size={null}
      onClick={onSelect}
      className={cn(
        "w-full justify-start gap-3 whitespace-normal rounded-2xl border border-hairline bg-raised p-3.5 text-left font-normal text-fg tracking-normal hover:border-violet-500/50 hover:bg-violet-50 sm:gap-4 sm:p-4 md:px-5",
        className,
      )}
    >
      {icon ? <IconBadge icon={icon} size="sm" interactive /> : null}
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
        className="size-4 text-highlight transition-transform duration-500 ease-brand group-hover/button:translate-x-1 motion-reduce:transition-none"
      />
    </Button>
  );
}

/**
 * The result question with `{{format}}` replaced by `format` (the
 * highlighted format name); without the token, the text alone.
 */
function withFormat(template: string, format: ReactNode): ReactNode {
  const [before, ...rest] = template.split("{{format}}");
  if (rest.length === 0) return template;
  return (
    <>
      {before}
      {format}
      {rest.join("")}
    </>
  );
}

/**
 * The partnership finder's panel: two questions (goal, then timeframe) lead
 * to a recommended format with the contact actions, which carry the answers
 * into the email and the booking notes. Each step moves focus to its heading
 * and scrolls the panel below the fixed header. Needs a PartnershipProvider.
 */
export function PartnershipFinder() {
  const { selection, dispatch, copy } = usePartnership();
  const { step, intent } = selection;
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const recommendation = getPartnershipRecommendation(selection, copy);
  const selectedIntent = copy.intents.find((item) => item.id === intent);
  const activeIndex = step === "intent" ? 0 : step === "duration" ? 1 : 2;

  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      previousStep.current = step;
    }
  }, [step]);

  return (
    <div
      ref={panel}
      data-tone="paper"
      className="min-h-110 scroll-mt-header rounded-4xl border border-hairline p-4 shadow-lift sm:p-7 md:p-9"
    >
      <ol
        className="flex items-center gap-x-5 gap-y-2"
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
              className={cn(
                "flex items-center gap-2 text-meta",
                current ? "font-semibold text-fg" : "text-fg-subtle",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full font-semibold text-eyebrow tracking-normal transition-colors duration-500 motion-reduce:transition-none",
                  current || complete
                    ? "bg-violet-950 text-white"
                    : "bg-fg/[0.07]",
                )}
              >
                {complete ? (
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              {/* Phones show every number but only the current label. */}
              <span className={current ? undefined : "max-sm:sr-only"}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <div aria-hidden className="mt-5 h-px overflow-hidden bg-hairline">
        <div
          className="h-full origin-left bg-violet-500 transition-transform duration-700 ease-brand motion-reduce:transition-none"
          style={{ transform: `scaleX(${(activeIndex + 1) / 3})` }}
        />
      </div>
      <div key={step} className="pt-6 motion-safe:animate-rise-sm md:pt-7">
        {step !== "intent" ? (
          <Button
            variant="ghost"
            size="sm"
            className="-mt-2 mb-3 -ml-4 text-fg-muted hover:text-fg"
            onClick={() => dispatch({ type: "back" })}
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-500 ease-brand group-hover/button:-translate-x-0.5 motion-reduce:transition-none"
            />
            Back
          </Button>
        ) : null}
        {step === "intent" ? (
          <>
            <h3 ref={heading} tabIndex={-1} className={stepHeading}>
              {copy.prompts.intentQuestion}
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {copy.intents.map((item) => (
                <FinderOption
                  key={item.id}
                  icon={icons[item.id]}
                  label={item.label}
                  detail={item.detail}
                  onSelect={() => dispatch({ type: "intent", intent: item.id })}
                />
              ))}
            </div>
          </>
        ) : step === "duration" ? (
          <>
            <p className={cn(stepLabel, "mb-3")}>{selectedIntent?.label}</p>
            <h3 ref={heading} tabIndex={-1} className={stepHeading}>
              {copy.prompts.durationQuestion}
            </h3>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {copy.durations.map((item) => (
                <FinderOption
                  key={item.id}
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
            <span className={cn(stepLabel, "mb-3")}>
              <Check aria-hidden className="size-4" />
              {selectedIntent?.label}
            </span>
            <h3 ref={heading} tabIndex={-1} className={stepHeading}>
              {withFormat(
                copy.prompts.resultQuestion,
                <Highlight>{recommendation.name}</Highlight>,
              )}
            </h3>
            <Text className="mt-5">{recommendation.description}</Text>
            {intent === "hackathon" && selection.duration === "ongoing" ? (
              <p className="mt-4 font-semibold text-body text-highlight">
                {copy.prompts.firstChoice}
              </p>
            ) : null}
            <ContactActions className="mt-7 max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 -ml-4 text-fg-muted hover:text-fg"
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
  );
}
