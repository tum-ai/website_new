// src/components/community/JourneySection.jsx

import { type Step, steps } from "@/data/community";
import { Card } from "../ui/card";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faHandshake,
  faBrain,
  faGlobeAmericas,
  faChartLine,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

// Map steps to Font Awesome icons
const stepIcons = [
  faRocket, // Batch Introduction
  faBrain, // Research Track
  faHandshake, // Initiative Track
  faChartLine, // Growth Opportunities
  faGlobeAmericas, // Research Exchange (REX) Program
  faGraduationCap, // Alumni
];

// Corrected color scheme for the ICONS (a unique color for each of the 6 steps)
export const iconColors = [
  "#C084FC", // Purple for Batch Introduction
  "#4FD1C5", // Teal for Research Track
  "#F472B6", // Pink for Initiative Track
  "#FDE047", // Yellow for Growth Opportunities
  "#60A5FA", // Light Blue for Research Exchange (REX) Program
  "#FB923C", // Orange for Alumni
  "#34D399", // Emerald green for Collaboration
  "#A78BFA", // Lavender for Mentorship
  "#F87171", // Red for Special Events
];

// Corrected background colors for the radial gradient glow
export const glowColors = [
  "#3A1772", // Dark purple for Batch Introduction
  "#007266", // Dark teal for Research Track
  "#721D50", // Dark magenta for Initiative Track
  "#7A6000", // Dark yellow for Growth Opportunities
  "#141972", // Deep blue for Research Exchange (REX) Program
  "#B45B31", // Orange-brown for Alumni
  "#00593D", // Dark green for Collaboration
  "#4B0082", // Indigo for Mentorship
  "#7A1C1C", // Deep red for Special Events
];

const StepCard = ({ step, index }: { step: Step; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.3)" }}
    whileTap={{ scale: 0.98 }}
    className="relative cursor-pointer"
  >
    <Card
      className="relative p-6 text-white border border-white/10 rounded-3xl shadow-lg h-full overflow-hidden
      before:absolute before:inset-0 before:opacity-50 before:bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] before:from-purple-900 before:to-transparent"
      style={{
        backgroundColor: "#18112F",
        boxShadow: "0px 5px 15px rgba(0,0,0,0.2), 0px 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          background: `radial-gradient(circle at center, ${glowColors[index]} 0%, transparent 70%)`,
        }}
      ></div>
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold tracking-widest text-white/70 mb-1">
            {step.step}
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
            {step.name}
          </h3>
        </div>
        <div
          className="h-16 w-16 flex items-center justify-center text-4xl"
          style={{ color: iconColors[index] }}
        >
          <FontAwesomeIcon icon={stepIcons[index]} />
        </div>
      </div>
      <p className="relative z-10 mt-4 text-sm leading-snug text-white/80">
        {step.description}
      </p>
    </Card>
  </motion.div>
);

const JourneyPathSVG = () => (
  <svg
    className="absolute inset-0 w-full h-full z-0"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <path
      d="M50 0 V30"
      stroke="url(#pathGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M50 30 C50 35, 25 40, 25 50"
      stroke="url(#pathGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M50 30 C50 35, 75 40, 75 50"
      stroke="url(#pathGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M25 50 C25 60, 50 65, 50 70"
      stroke="url(#pathGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M75 50 C75 60, 50 65, 50 70"
      stroke="url(#pathGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M50 70 L50 85"
      stroke="url(#pathGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M50 85 L50 100"
      stroke="url(#pathGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <defs>
      <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: "rgba(128, 90, 213, 0.4)" }} />
        <stop offset="100%" style={{ stopColor: "rgba(182, 90, 213, 0.4)" }} />
      </linearGradient>
    </defs>
  </svg>
);

export const JourneySection = () => {
  const customSteps = [
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
        "Join a team on an Impact Project applying AI to real world challenges. Contribute to research, academe publications, or open-Source work, and engage with the TUM.ai community through...",
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
        "After your first semester, expand your impact — Join new teams, lead a task force, or take on a Team Lead role.",
    },
    {
      step: "04",
      name: "Research Exchange (REX) Program",
      description:
        "After one semester, you can Join the REX Program — conduct research at top institutions like MIT, Harvard, or Cambridge. With our alumni network, we guide you in finding a topic, navigating applications, and contributing to surting-edge research.",
    },
    {
      step: "05",
      name: "Alumni Program",
      description:
        "Having been with TUM.ai for two or more semesters, you can join the Alumni Program, opening up opportunities for continued networking and collaboration.",
    },
  ];

  return (
    <div className="relative pt-32 pb-16 px-4 md:px-8 z-10 w-full max-w-7xl mx-auto text-center overflow-hidden">
      <div className="mb-12">
        <h1 className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
          The TUM.ai Member Journey
        </h1>
        <p className="mx-auto max-w-2xl text-white/80 pt-4 text-base md:text-lg">
          At TUM.ai, members contribute through AI projects, workshops, and
          community initiatives — turning bold ideas into real-world impact.
        </p>
      </div>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8 lg:gap-x-12 mt-16">
        <JourneyPathSVG />
        <div className="col-span-1 md:col-start-1 md:col-end-3 justify-self-center max-w-md w-full">
          <StepCard step={customSteps[0]} index={0} />
        </div>
        <div className="col-span-1">
          <StepCard step={customSteps[1]} index={1} />
        </div>
        <div className="col-span-1">
          <StepCard step={customSteps[2]} index={2} />
        </div>
        <div className="col-span-1 md:col-start-1 md:col-end-3 justify-self-center max-w-md w-full">
          <StepCard step={customSteps[3]} index={3} />
        </div>
        <div className="col-span-1 md:col-start-1 md:col-end-3 justify-self-center max-w-md w-full">
          <StepCard step={customSteps[4]} index={4} />
        </div>
        <div className="col-span-1 md:col-start-1 md:col-end-3 justify-self-center max-w-md w-full">
          <StepCard step={customSteps[5]} index={5} />
        </div>
      </div>
    </div>
  );
};
