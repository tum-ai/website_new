import { type Step, steps } from "@/data/community";
import { Card } from "../ui/card";
import { motion } from "framer-motion";

const stepIcons = ["🎉", "🧠", "🤝", "🚀", "🌍", "🏆"];

const StepCard = ({ step, index }: { step: Step; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    <Card className="relative h-auto p-6 text-center text-white border-none bg-gradient-to-br from-purple-600/80 to-indigo-700/80 rounded-2xl shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-transform duration-300">
      <div className="absolute top-4 left-4 text-[10px] font-semibold tracking-widest text-white/70">
        {step.step}
      </div>
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
          {stepIcons[index % stepIcons.length]}
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold tracking-tight text-white">
        {step.name}
      </h3>
      <p className="mx-auto max-w-[90%] text-sm leading-snug text-white/80">
        {step.description}
      </p>
    </Card>
  </motion.div>
);

// Vertical arrow
const VerticalArrow = () => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="flex items-center justify-center my-2"
  >
    <svg className="w-4 h-8 text-white opacity-40" viewBox="0 0 10 20" fill="none">
      <line x1="5" y1="0" x2="5" y2="15" stroke="currentColor" strokeWidth="2" />
      <polygon points="0,15 5,20 10,15" fill="currentColor" />
    </svg>
  </motion.div>
);

export const JourneySection = () => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative pt-24 pb-16 px-8 z-10 w-full max-w-5xl space-y-10 text-center">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            The TUM.ai Member Journey
          </h1>
          <p className="mx-auto max-w-2xl text-white/80 pt-4 text-base md:text-lg">
            At TUM.ai, members contribute through AI projects, workshops, and community initiatives —
            turning bold ideas into real-world impact.
          </p>
        </div>

        {/* Journey Steps */}
        <div className="flex flex-col gap-4 relative">
          {/* Batch Intro */}
          <StepCard step={steps[0]} index={0} />
          <VerticalArrow />

          {/* Research or Initiative (branching choice) */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center relative">
            <StepCard step={steps[1]} index={1} />
            <StepCard step={steps[2]} index={2} />
          </div>
          <VerticalArrow />

          {/* Growth */}
          <StepCard step={steps[3]} index={3} />
          <VerticalArrow />

          {/* Research Exchange */}
          <StepCard step={steps[4]} index={4} />
          <VerticalArrow />

          {/* Alumni */}
          <StepCard step={steps[5]} index={5} />
        </div>
      </div>
    </div>
  );
};
