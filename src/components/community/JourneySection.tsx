"use client";

import {
  Brain,
  ChartNoAxesColumn,
  Globe,
  GraduationCap,
  Handshake,
  type LucideIcon,
  Rocket,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Card } from "../ui/card";

type Step = {
  step: string;
  name: string;
  description: string;
};

type AnimatedCardProps = {
  delayMs: number;
  isVisible: boolean;
  children: React.ReactNode;
};

type StepCardProps = {
  step: Step;
  index: number;
  delayMs: number;
  isVisible: boolean;
};

type CombinedStepCardProps = {
  steps: Step[];
  indices: number[];
  delayMs: number;
  isVisible: boolean;
};

type PathSegmentProps = {
  delayMs: number;
  d: string;
  isVisible: boolean;
};

const stepIcons: LucideIcon[] = [
  Rocket,
  Brain,
  Handshake,
  ChartNoAxesColumn,
  Globe,
  GraduationCap,
];

export const iconColors = [
  "#C084FC",
  "#4FD1C5",
  "#F472B6",
  "#FDE047",
  "#60A5FA",
  "#FB923C",
  "#34D399",
  "#A78BFA",
  "#F87171",
] as const;

const glowColor = "#9A64D9";
const connectorDelayMs = 300;

const customSteps: Step[] = [
  {
    step: "01",
    name: "Batch Introduction",
    description:
      "Kick off your journey at the onboarding weekend! Meet members, join social events, and deepen connections on our getaway.",
  },
  {
    step: "02A",
    name: "Research Track",
    description:
      "Join a team on an Impact Project applying AI to real world challenges. Contribute to research, academic publications, or open-source work, and engage with the TUM.ai community through update sessions.",
  },
  {
    step: "02B",
    name: "Initiative Track",
    description:
      "Join one of our core departments and become a driving force behind everything that makes TUM.ai stand out. Shape the future of TUM.ai and develop your skills while engaging in trips, events, and learning opportunities.",
  },
  {
    step: "03",
    name: "Growth Opportunities",
    description:
      "After your first semester, expand your impact - Join new teams, lead a task force, or take on a Team Lead role.",
  },
  {
    step: "04",
    name: "Research Exchange (REX) Program",
    description:
      "After one semester, you can join the REX Program - conduct research at top institutions like MIT, Harvard, or Cambridge. With our alumni network, we guide you in finding a topic, navigating applications, and contributing to cutting-edge research.",
  },
  {
    step: "05",
    name: "Alumni Program",
    description:
      "Having been with TUM.ai for two or more semesters, you can join the Alumni Program, opening up opportunities for continued networking and collaboration.",
  },
];

function AnimatedCard({ delayMs, isVisible, children }: AnimatedCardProps) {
  return (
    <div
      className="journey-card relative"
      data-active={isVisible}
      style={{ ["--journey-delay" as string]: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

function StepCard({ step, index, delayMs, isVisible }: StepCardProps) {
  const Icon = stepIcons[index];

  return (
    <AnimatedCard delayMs={delayMs} isVisible={isVisible}>
      <Card
        className="relative h-full overflow-hidden rounded-3xl border border-primary/30 bg-[#18112F] p-6 text-white shadow-lg
        before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] before:from-purple-900 before:to-transparent before:opacity-50"
      >
        <div
          className="absolute inset-0 z-0 opacity-50"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} -30%, transparent 80%)`,
          }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div className="invisible h-16 w-16" />
          <div className="flex flex-col">
            <div className="text-sm tracking-widest text-white/70">
              {step.step}
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {step.name}
            </h3>
          </div>
          <div
            className="flex h-16 w-16 items-center justify-center"
            style={{ color: iconColors[index] }}
          >
            <Icon className="h-10 w-10" />
          </div>
        </div>
        <p className="relative z-10 mt-4 text-sm leading-snug text-white/80">
          {step.description}
        </p>
      </Card>
    </AnimatedCard>
  );
}

function CombinedStepCard({
  steps,
  indices,
  delayMs,
  isVisible,
}: CombinedStepCardProps) {
  return (
    <AnimatedCard delayMs={delayMs} isVisible={isVisible}>
      <Card
        className="relative h-full overflow-hidden rounded-3xl border border-primary/30 bg-[#18112F] p-6 text-white shadow-lg
        before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] before:from-purple-900 before:to-transparent before:opacity-50"
      >
        <div
          className="absolute inset-0 z-0 opacity-50"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} -30%, transparent 80%)`,
          }}
        />
        <div className="relative z-10">
          <div className="block md:hidden">
            {steps.map((step, idx) => {
              const Icon = stepIcons[indices[idx]];

              return (
                <div key={step.step}>
                  <div className="mb-4 flex items-start justify-between">
                    <div className="invisible h-16 w-16" />
                    <div className="flex flex-col">
                      <div className="text-sm tracking-widest text-white/70">
                        {step.step}
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight text-white">
                        {step.name}
                      </h3>
                    </div>
                    <div
                      className="flex h-16 w-16 items-center justify-center"
                      style={{ color: iconColors[indices[idx]] }}
                    >
                      <Icon className="h-10 w-10" />
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-snug text-white/80">
                    {step.description}
                  </p>
                  {idx < steps.length - 1 && (
                    <div className="my-6 flex items-center justify-center">
                      <div className="h-px flex-1 bg-white/20" />
                      <span className="mx-4 text-sm font-semibold text-white/60">
                        OR
                      </span>
                      <div className="h-px flex-1 bg-white/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative hidden items-stretch gap-8 md:flex">
            {steps.map((step, idx) => {
              const Icon = stepIcons[indices[idx]];

              return (
                <div key={step.step} className="flex-1">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="invisible h-16 w-16" />
                    <div className="flex flex-col">
                      <div className="text-sm tracking-widest text-white/70">
                        {step.step}
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight text-white">
                        {step.name}
                      </h3>
                    </div>
                    <div
                      className="flex h-16 w-16 items-center justify-center"
                      style={{ color: iconColors[indices[idx]] }}
                    >
                      <Icon className="h-10 w-10" />
                    </div>
                  </div>
                  <p className="text-sm leading-snug text-white/80">
                    {step.description}
                  </p>
                </div>
              );
            })}

            <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center px-4 md:flex">
              <div className="flex h-full flex-col items-center justify-center">
                <div className="min-h-[2rem] w-px flex-1 bg-white/20" />
                <span className="my-4 whitespace-nowrap text-sm font-semibold text-white/60">
                  OR
                </span>
                <div className="min-h-[2rem] w-px flex-1 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AnimatedCard>
  );
}

function PathSegment({ delayMs, d, isVisible }: PathSegmentProps) {
  return (
    <path
      className="journey-path-segment"
      d={d}
      data-active={isVisible}
      pathLength={1}
      stroke="url(#pathGradient)"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
      style={{
        filter: "drop-shadow(0 0 16px var(--color-tumai-violet))",
        ["--journey-delay" as string]: `${delayMs}ms`,
      }}
    />
  );
}

function JourneyPathSVG({ visibleStages }: { visibleStages: boolean[] }) {
  return (
    <svg
      className="pointer-events-none absolute top-0 left-1/2 z-0 hidden -translate-x-1/2 md:block"
      width="600"
      height="1100"
      viewBox="0 0 600 1100"
      fill="none"
      style={{ minWidth: 600, minHeight: 1100 }}
    >
      <PathSegment
        d="
          M300 40
          L300 180
          C300 220, 120 240, 120 320
          L120 400
        "
        delayMs={connectorDelayMs}
        isVisible={visibleStages[1]}
      />
      <PathSegment
        d="
          M300 180
          C300 220, 480 240, 480 320
          L480 400
        "
        delayMs={connectorDelayMs}
        isVisible={visibleStages[1]}
      />
      <PathSegment
        d="
          M120 400
          C120 500, 300 520, 300 600
        "
        delayMs={connectorDelayMs}
        isVisible={visibleStages[2]}
      />
      <PathSegment
        d="
          M480 400
          C480 500, 300 520, 300 600
        "
        delayMs={connectorDelayMs}
        isVisible={visibleStages[2]}
      />
      <PathSegment
        d="M300 600 L300 700"
        delayMs={connectorDelayMs}
        isVisible={visibleStages[3]}
      />
      <PathSegment
        d="M300 700 L300 860"
        delayMs={connectorDelayMs}
        isVisible={visibleStages[4]}
      />
      <PathSegment
        d="M300 860 L300 1020"
        delayMs={connectorDelayMs}
        isVisible={visibleStages[4]}
      />
      <defs>
        <linearGradient
          id="pathGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1100"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9A64D9" />
          <stop offset="1" stopColor="#F5EFFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function JourneySection() {
  const [visibleStages, setVisibleStages] = useState<boolean[]>(() =>
    Array.from({ length: 5 }, () => false),
  );
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const observers = stageRefs.current.map(
      (element, index) =>
        new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) {
              return;
            }

            setVisibleStages((currentStages) => {
              if (currentStages[index]) {
                return currentStages;
              }

              const nextStages = [...currentStages];
              nextStages[index] = true;
              return nextStages;
            });
          },
          { rootMargin: "0px 0px -18% 0px", threshold: 0.35 },
        ),
    );

    for (const [index, observer] of observers.entries()) {
      const element = stageRefs.current[index];
      if (!element) {
        continue;
      }

      observer.observe(element);
    }

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative z-10 mx-auto w-full max-w-[1600px] overflow-hidden px-4 pt-32 pb-16 text-center md:px-8"
    >
      <div className="mb-12">
        <h1 className="text-4xl font-bold md:text-5xl">
          The TUM.ai
          <b className="bg-gradient-to-r font-semibold from-[#9A64D9] to-[#F5EFFF] bg-clip-text text-transparent">
            {" "}
            Member Journey
          </b>
        </h1>
        <p className="mx-auto max-w-2xl pt-4 text-base text-white/80 md:text-lg">
          At TUM.ai, members contribute through AI projects, workshops, and
          community initiatives - turning bold ideas into real-world impact.
        </p>
      </div>
      <div className="relative mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:gap-x-12">
        <JourneyPathSVG visibleStages={visibleStages} />
        <div
          ref={(node) => {
            stageRefs.current[0] = node;
          }}
          className="col-span-1 w-full max-w-md justify-self-center md:col-start-1 md:col-end-3"
        >
          <StepCard
            step={customSteps[0]}
            index={0}
            delayMs={0}
            isVisible={visibleStages[0]}
          />
        </div>
        <div
          ref={(node) => {
            stageRefs.current[1] = node;
          }}
          className="col-span-1 w-full max-w-md justify-self-center md:col-start-1 md:col-end-3 md:max-w-5xl"
        >
          <CombinedStepCard
            steps={[customSteps[1], customSteps[2]]}
            indices={[1, 2]}
            delayMs={0}
            isVisible={visibleStages[1]}
          />
        </div>
        <div
          ref={(node) => {
            stageRefs.current[2] = node;
          }}
          className="col-span-1 w-full max-w-md justify-self-center md:col-start-1 md:col-end-3"
        >
          <StepCard
            step={customSteps[3]}
            index={3}
            delayMs={0}
            isVisible={visibleStages[2]}
          />
        </div>
        <div
          ref={(node) => {
            stageRefs.current[3] = node;
          }}
          className="col-span-1 w-full max-w-md justify-self-center md:col-start-1 md:col-end-3"
        >
          <StepCard
            step={customSteps[4]}
            index={4}
            delayMs={0}
            isVisible={visibleStages[3]}
          />
        </div>
        <div
          ref={(node) => {
            stageRefs.current[4] = node;
          }}
          className="col-span-1 w-full max-w-md justify-self-center md:col-start-1 md:col-end-3"
        >
          <StepCard
            step={customSteps[5]}
            index={5}
            delayMs={0}
            isVisible={visibleStages[4]}
          />
        </div>
      </div>
    </div>
  );
}
