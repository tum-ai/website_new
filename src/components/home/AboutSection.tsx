import { Button } from "../ui/button";
import { archivo } from "@/styles/fonts";
import { MotionValue } from "framer-motion";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const AboutSection = () => {
  return (
    <div className="flex flex-col min-h-screen px-10 py-10 md:py-16">
      {/* Image */}
      <div className="w-full flex items-center justify-center flex-1">
        <img
          className="w-full h-[19rem] md:h-[30rem] object-cover bg-gray-200 rounded-xl"
          src="/assets/aibootcamp.jpg"
          alt="TUM.ai ai bootcamp"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
        <div className="flex flex-col gap-4 w-full md:w-2/5 text-center md:text-left">
          <p className="text-xl md:text-2xl">
            With over <b>90 active members</b>, TUM.ai connects students and
            stakeholders to drive positive societal impact through AI.
          </p>
          <Button className="w-48 self-center md:self-start !bg-[#6517A1]">
            <a href="/community">Meet our Members</a>{" "}
            {/* add a link to community */}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-3/5">
          <Stat title={"Alumni Members"} from={0} to={400} suffix="+" />
          <Stat title={"Founding Year"} from={0} to={2020} suffix="" />
          <Stat title={"Nationalities"} from={0} to={33} suffix="+" />
          <Stat title={"Majors"} from={0} to={15} suffix="+" />
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
    <div ref={ref} className="flex flex-col justify-start items-start">
      <motion.div className={`text-4xl font-bold`}>
        <span className="inline-flex items-start justify-start px-3 py-2 text-[#6517A1E5] ">
          <AnimatedText value={rounded} suffix={suffix} />
        </span>
      </motion.div>
      <div
        className={`mt-2 text-xl text-gray-600`}
        style={{ fontFamily: archivo }}
      >
        {title}
      </div>
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
