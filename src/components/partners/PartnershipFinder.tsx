"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FlaskConical,
  type LucideIcon,
  Megaphone,
  RotateCcw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import {
  Button,
  Container,
  Highlight,
  Reveal,
  Section,
  Text,
} from "@/components/ds";
import { partnershipDurations, partnershipIntents } from "@/data/partners";
import { getPartnershipRecommendation } from "@/lib/partnerships";
import { ContactActions } from "./ContactActions";
import { usePartnership } from "./PartnershipContext";

const icons = {
  talent: Users,
  hackathon: Zap,
  brand: Megaphone,
  research: FlaskConical,
};

const steps = ["Your goal", "Your timeframe", "Your fit"];

/* Step headings receive focus programmatically; the panel scrolls below the fixed header. */
const stepHeading =
  "scroll-mt-[110px] text-heading-lg text-fg outline-none focus-visible:outline-none";
const stepLabel =
  "flex items-center gap-2 text-eyebrow text-highlight uppercase";

function FinderOption({
  icon: Icon,
  label,
  detail,
  onSelect,
}: {
  icon?: LucideIcon;
  label: ReactNode;
  detail: ReactNode;
  onSelect: () => void;
}) {
  return (
    <Button
      variant={null}
      size={null}
      onClick={onSelect}
      className="w-full justify-start gap-3 rounded-2xl border border-hairline bg-raised p-3.5 text-left font-normal tracking-normal whitespace-normal text-fg hover:border-violet-500/50 hover:bg-violet-50 sm:gap-4 sm:p-4 md:px-5"
    >
      {Icon ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500/12 sm:size-10 sm:rounded-xl text-highlight ring-1 ring-violet-500/20 ring-inset transition-[background-color,color,rotate] duration-500 ease-brand group-hover/button:-rotate-6 group-hover/button:bg-violet-600 group-hover/button:text-white">
          <Icon aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <strong className="block text-body font-semibold text-fg">
          {label}
        </strong>
        <small className="mt-0.5 block text-small text-fg-muted">
          {detail}
        </small>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 text-highlight transition-transform duration-500 ease-brand group-hover/button:translate-x-1"
      />
    </Button>
  );
}

export default function PartnershipFinder() {
  const { selection, dispatch } = usePartnership();
  const { step, intent } = selection;
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const recommendation = getPartnershipRecommendation(selection);
  const selectedIntent = partnershipIntents.find((item) => item.id === intent);
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
    <Section
      id="find-your-fit"
      tone="lavender"
      aria-labelledby="finder-title"
      className="scroll-mt-[110px]"
    >
      <Container className="grid gap-10 md:gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12 xl:gap-20">
        <Reveal>
          <p className={stepLabel}>
            <Sparkles aria-hidden className="size-4" />
            Your way in
          </p>
          <h2 id="finder-title" className="mt-5 text-display-md text-fg">
            Big ambitions.
            <br />
            The right partnership.
          </h2>
          <Text size="lead" className="mt-6 max-w-sm">
            Tell us what you have in mind. We’ll find your place in the
            ecosystem.
          </Text>
          <Text
            as="span"
            size="meta"
            tone="subtle"
            className="mt-6 block max-w-xs lg:mt-8"
          >
            Two quick questions. No forms. Just a starting point.
          </Text>
        </Reveal>
        <Reveal delay={120}>
          <div
            ref={panel}
            data-tone="paper"
            className="min-h-[27.5rem] scroll-mt-[110px] rounded-4xl border border-hairline p-4 shadow-lift sm:p-7 md:p-9"
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
                    className={
                      current
                        ? "flex items-center gap-2 text-meta font-semibold text-fg"
                        : "flex items-center gap-2 text-meta text-fg-subtle"
                    }
                  >
                    <span
                      className={
                        current || complete
                          ? "grid size-6 place-items-center rounded-full bg-violet-950 text-[0.6875rem] font-semibold text-white transition-colors duration-500"
                          : "grid size-6 place-items-center rounded-full bg-fg/[0.07] text-[0.6875rem] font-semibold transition-colors duration-500"
                      }
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
            <div
              key={step}
              className="pt-6 motion-safe:animate-rise-sm md:pt-7"
            >
              {step !== "intent" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mt-2 mb-3 -ml-4 text-fg-muted hover:text-fg"
                  onClick={() => dispatch({ type: "back" })}
                >
                  <ArrowLeft
                    aria-hidden
                    className="size-4 transition-transform duration-500 ease-brand group-hover/button:-translate-x-0.5"
                  />
                  Back
                </Button>
              ) : null}
              {step === "intent" ? (
                <>
                  <h3 ref={heading} tabIndex={-1} className={stepHeading}>
                    What matters most to you right now?
                  </h3>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {partnershipIntents.map((item) => (
                      <FinderOption
                        key={item.id}
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
              ) : step === "duration" ? (
                <>
                  <p className={`${stepLabel} mb-3`}>{selectedIntent?.label}</p>
                  <h3 ref={heading} tabIndex={-1} className={stepHeading}>
                    Are you looking for a one-off activation or an ongoing
                    relationship?
                  </h3>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 [&>button]:min-h-[5.4rem]">
                    {partnershipDurations.map((item) => (
                      <FinderOption
                        key={item.id}
                        label={item.label}
                        detail={item.detail}
                        onSelect={() =>
                          dispatch({ type: "duration", duration: item.id })
                        }
                      />
                    ))}
                  </div>
                </>
              ) : recommendation ? (
                <div>
                  <span className={`${stepLabel} mb-3`}>
                    <Check aria-hidden className="size-4" />
                    {selectedIntent?.label}
                  </span>
                  <h3 ref={heading} tabIndex={-1} className={stepHeading}>
                    Sounds like a <Highlight>{recommendation.name}</Highlight>{" "}
                    is a good fit.
                  </h3>
                  <Text className="mt-5">{recommendation.description}</Text>
                  {intent === "hackathon" &&
                  selection.duration === "ongoing" ? (
                    <p className="mt-4 text-body font-semibold text-highlight">
                      With first choice on hackathon slots.
                    </p>
                  ) : null}
                  <ContactActions className="mt-7 max-sm:flex-col max-sm:items-stretch" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 -ml-4 text-fg-muted hover:text-fg"
                    onClick={() => dispatch({ type: "reset" })}
                  >
                    <RotateCcw
                      aria-hidden
                      className="size-3.5 transition-transform duration-500 ease-brand group-hover/button:-rotate-45"
                    />
                    Start again
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
