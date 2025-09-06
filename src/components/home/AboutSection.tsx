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
import "../../styles/index.css";

export const AboutSection = () => {
  return (
    <div className="flex flex-col gap-8 min-h-screen p-8 md:p-10">
      <div className="w-full flex items-center md:max-h-2/3 flex-1">
        <img
          className="object-cover bg-gray-200 rounded-xl"
          src="/assets/apply/new_section_photo_1.jpg"
          alt="TUM.ai members"
        />
      </div>
      <div className="flex flex-wrap md:min-h-1/3 my-2 w-full justify-between">
        <div className="flex flex-col w-full md:w-3/6 text-start md:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="text-title sm:text-2xl md:text-[2rem] font-semibold">
              What is{" "}
              <span className="gradient-text font-bold">
                TUM.ai
              </span>
              {"?"}
            </h1>
            <p className="text-xl md:text-2xl">
              With over 90 active members, TUM.ai empowers the next generation of AI innovators.
              Founded in 2020, our mission is to create 
              <span className="text-primary font-bold"> {" "}
                a community of students who innovate, research, and build at the forefront of AI</span>
                , fostering both groundbreaking research and entrepreneurial ventures across diverse industries.
                
            </p>
            <Button
              asChild
              variant="primary"
              className="w-full rounded-md px-6 py-3 mt-4 mb-6 md:mb-0 text-center md:w-auto"
            >
              <a href="/community#memberStories">Meet our Members</a>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-center-safe items-center w-full md:w-3/7">
          <div className="flex w-full justify-center items-center">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 w-full">
              <Stat title={"Alumni Members"} from={0} to={400} suffix="+" />
              <Stat title={"Founding Year"} from={0} to={2020} suffix="" />
              <Stat title={"Nationalities"} from={0} to={33} suffix="+" />
              <Stat title={"Majors"} from={0} to={15} suffix="+" />
            </div>
          </div>
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
        <span className="inline-flex items-start justify-start py-2 gradient-text">
          <AnimatedText value={rounded} suffix={suffix} />
        </span>
      </motion.div>
      <div className={`mt-2 text-xl font-medium text-gray-600`}>{title}</div>
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
