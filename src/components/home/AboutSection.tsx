import { MotionValue } from "framer-motion";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export const AboutSection = () => {
  return (
    <div className="flex flex-col gap-8 min-h-screen p-8 md:p-10">
      <div className="w-full flex items-center justify-center flex-1">
        <img
          className="w-full aspect-[7/4] object-cover bg-gray-200 rounded-xl"
          src="/assets/apply/new_section_photo_1.jpg"
          // src="/assets/aibootcamp.jpg"
          alt="TUM.ai members"
        />
      </div>
      <div className="flex flex-col items-center gap-8 flex-1">
        <div className="flex flex-col gap-8 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center ">
            <h1 className="text-title sm:text-2xl md:text-[2rem] font-semibold">
              What is{" "}
              <span className="bg-gradient-to-r from-[#6517A1] to-[#B57CFF] bg-clip-text text-transparent">
                TUM.ai
              </span>{"?"}
            </h1>
            <Button
              asChild
              variant="primary"
              className="w-full rounded-md px-6 py-3 text-center md:w-auto"
            >
              <a href="/community#memberStories">Meet our Members</a>
            </Button>

          </div>
          <p className="text-xl md:text-2xl">
            With over 90 active members, TUM.ai empowers the next generation of AI innovators. 
            Founded in 2020, our mission is to create <b>a community of students who innovate, research, and build at the forefront of AI</b>, fostering both groundbreaking research and entrepreneurial ventures across diverse industries.
          </p>
        </div>
        <div className="flex flex-col gap-8 w-full text-center md:text-left md:flex-row">
          <div className="flex w-full md:w-1/3 items-center">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 w-full">
              <Stat title={"Alumni Members"} from={0} to={400} suffix="+" />
              <Stat title={"Founding Year"} from={0} to={2020} suffix="" />
              <Stat title={"Nationalities"} from={0} to={33} suffix="+" />
              <Stat title={"Majors"} from={0} to={15} suffix="+" />
            </div>
          </div>
          <div className="flex w-full md:w-2/3 items-center">
            <p className="text-lg md:text-xl text-stone-400">
              Together with our highly-talented members, we conduct <b className="text-black">cutting-edge research projects</b>, develop <b className="text-black">AI-powered solutions with industry partners</b>, incubate <b className="text-black">innovative startups</b>, and <b className="text-black">organize workshops</b> that bridge academic knowledge with real-world applications. 
              Through strategic <b className="text-black">partnerships and connections</b> with leading AI tech and industry companies, we create unique opportunities for <b className="text-black">collaboration, mentorship, and career development</b>. 
              We aim to <b className="text-black">lower the entry barriers to AI</b> creation and usage for people from every domain by establishing a platform for practical experience through diverse applied AI projects, research initiatives, and entrepreneurial opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function Stat({
  title,
  from = 0,
  to,
  suffix = "",
}: {
  title: string;
  from?: number;
  to: number;
  suffix?: string;
  isMoney?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { stiffness: 50, damping: 26 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      mv.set(to);
    }
  }, [inView, mv, to]);

  return (
    <div ref={ref} className="flex flex-col justify-start items-center md:items-start">
      <motion.div className={`text-4xl font-bold`}>
        <span className="inline-flex items-start justify-start py-2 text-[#6517A1E5]">
          <AnimatedText value={rounded} suffix={suffix} />
        </span>
      </motion.div>
      <div className={`mt-2 text-xl text-gray-600`}>{title}</div>
    </div>
  );
}

function AnimatedText({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: MotionValue<number>;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [text, setText] = useState("0");
  useEffect(() => {
    const unsub = value.on("change", (v: number) => {
      const num =
        decimals > 0
          ? (Math.round(v * 10) / 10).toFixed(decimals)
          : Math.round(v).toString();
      setText(`${prefix}${num}${suffix}`);
    });
    return () => unsub();
  }, [value, prefix, suffix, decimals]);
  return <span>{text}</span>;
}
