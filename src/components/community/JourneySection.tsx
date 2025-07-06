import { type Step, steps } from "@/data/community";
import { cx } from "class-variance-authority";
import { ArrowDown } from "lucide-react";
import { Card } from "../ui/card";

const StepCard = ({ step }: { step: Step }) => (
  <Card className="h-full bg-slate-800/50 p-12 text-center text-white border-slate-700">
    <div className="absolute top-8 left-8 text-xs font-medium tracking-wide text-slate-400">
      {step.step}
    </div>
    <h3 className="mb-6 text-2xl font-semibold tracking-tight text-white">
      {step.name}
    </h3>
    <p className="mx-auto max-w-[85%] text-sm leading-relaxed text-slate-300">
      {step.description}
    </p>
  </Card>
);

const Arrow = ({ color = "white" }: { color?: string }) => (
  <div className="my-8 flex items-center justify-center">
    <ArrowDown className={`text-${color} text-lg opacity-40`} />
  </div>
);

export const JourneySection = () => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative z-10 w-full max-w-4xl space-y-16 text-center">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2
              className={cx(
                "mb-6 text-4xl font-semibold tracking-tight text-white",
              )}
            >
              The TUM.ai Member Journey
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white">
              All of our active members embark on an exciting journey - working
              on projects, driving AI innovation, and helping shape the TUM.ai
              community. At the heart of it all is our community, which empowers
              every member to grow, take initiative, and turn bold ideas into
              reality. No matter your ambition, TUM.ai is here to help you
              pursue it and make a meaningful impact - together.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {/* First Card */}
            <div className="relative w-full">
              <StepCard step={steps[0]} />
            </div>

            <Arrow />

            <div className="flex flex-col justify-center gap-8 lg:flex-row lg:gap-16">
              {steps.slice(1, 3).map((step) => (
                <div key={step.name} className="relative w-full lg:flex-1">
                  <StepCard step={step} />
                </div>
              ))}
            </div>

            {/* Double Arrows */}
            <div className="flex flex-col justify-center gap-8 lg:flex-row lg:gap-16">
              <div className="flex justify-center lg:flex-1">
                <Arrow color="white" />
              </div>
              <div className="hidden justify-center lg:flex lg:flex-1">
                <Arrow color="white" />
              </div>
            </div>

            {/* Growth Opportunities Card */}
            <div className="relative w-full">
              <StepCard step={steps[3]} />
            </div>

            <Arrow />

            {/* REX Program Card */}
            <div className="relative w-full">
              <StepCard step={steps[4]} />
            </div>

            <Arrow color="white" />

            {/* Alumni Program Card */}
            <div className="relative w-full">
              <StepCard step={steps[5]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
