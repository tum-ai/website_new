import { MotionValue } from "framer-motion";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Handshake, Monitor, Rocket, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ExpectationELab() {
  return (
    <section className="relative w-full bg-white py-16">
      <div className="relative mx-auto max-w-4xl px-6">
        {/* Content only */}
        <div className="w-full">
          <h2
            className={`text-center text-3xl md:text-4xl font-semibold uppercase tracking-tight text-black }`}
          >
            What to expect
          </h2>

          <p className="mt-4 text-center text-base leading-relaxed text-gray-700">
            Built by founders, for founders - 3 month's optimized for speed,
            learning, and real traction.
          </p>

          {/* Feature cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <FeatureCard
              title="Your own workspace"
              body="Desks, monitors, whiteboards; work from TUM.ai's headquarters."
              icon={<Monitor className="h-6 w-6" strokeWidth={1.8} />}
            />
            <FeatureCard
              title="Operator sessions"
              body="Weekly sessions with builders and founders who've done it before."
              icon={<Users className="h-6 w-6" strokeWidth={1.8} />}
            />
            <FeatureCard
              title="VC access"
              body="Warm intros and real feedback from top European funds."
              icon={<Handshake className="h-6 w-6" strokeWidth={1.8} />}
            />
            <FeatureCard
              title="Build > Talk"
              body="Fast paced, builder-driven environment. Accountability through community."
              icon={<Rocket className="h-6 w-6" strokeWidth={1.8} />}
            />
          </div>

          <p className={`mt-6 text-center text-base text-gray-600 }`}>
            Have an idea, a prototype, or just relentless drive, and are ready
            to build? Build it here. No equity. No theory.
            <br />
            Backed by TUM.ai and supported by leading VCs.
          </p>

          {/* Simple stats */}
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <Stat
                title={"AI E-Lab Startups since 2022"}
                from={0}
                to={38}
                suffix=""
              />
              <Stat
                title={"raised by AI E-lab lab ventures"}
                from={0}
                to={5}
                suffix="M+"
                isMoney
              />
              <Stat title={"AI E-Lab Iterations"} from={0} to={3} suffix="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  icon,
}: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/20 p-5 transition-all duration-300 hover:border-white/30 backdrop-blur-2xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(40px) saturate(180%)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="rounded-xl p-2 text-purple-700 transition-all duration-300 group-hover:scale-105"
          style={{
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(10px)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          {icon}
        </div>
        <div>
          <h3 className={`text-lg font-semibold text-gray-900 }`}>{title}</h3>
          <p className={`mt-1 text-sm leading-relaxed text-gray-700 `}>
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  title,
  from = 0,
  to,
  suffix = "",
  isMoney = false,
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
    <div ref={ref} className="text-center">
      <motion.div
        style={{ fontVariantNumeric: "tabular-nums" }}
        className={`text-6xl font-bold`}
      >
        <span
          className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white shadow-lg backdrop-blur-2xl border border-white/30"
          style={{
            background:
              "linear-gradient(135deg, rgba(124, 58, 237, 0.5) 0%, rgba(168, 85, 247, 0.45) 33%, rgba(236, 72, 153, 0.45) 66%, rgba(99, 102, 241, 0.5) 100%)",
            backdropFilter: "blur(20px) saturate(150%)",
            boxShadow:
              "0 8px 32px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          {isMoney ? (
            <AnimatedText
              value={rounded}
              prefix="€"
              suffix={suffix}
              decimals={0}
            />
          ) : (
            <AnimatedText value={rounded} suffix={suffix} />
          )}
        </span>
      </motion.div>
      <div className={`mt-2 text-sm text-gray-600`}>{title}</div>
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
