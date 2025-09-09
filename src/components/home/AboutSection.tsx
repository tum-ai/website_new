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
// import gsap from "gsap";
// import ScrollTrigger from "gsap/ScrollTrigger";
//
// gsap.registerPlugin(ScrollTrigger);
//
export const AboutSection = () => {
  const textRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const picRef = useRef<HTMLDivElement | null>(null);
  //
  //   useEffect(() => {
  //
  //     // disable animations on small screens (mobile) and respect reduced motion
  //     if (typeof window !== "undefined") {
  //       const mm = window.matchMedia && window.matchMedia("(max-width: 767px)");
  //       const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  //       if ((mm && mm.matches) || (reduce && reduce.matches)) {
  //         return;
  //       }
  //     }
  //
  //     if (!textRef.current || !wrapperRef.current) return;
  //
  //     // select the word spans inside the text container
  //     const words = textRef.current.querySelectorAll("span.word");
  //     if (!words || words.length === 0) return;
  //
  //     // make sure words are hidden before animation (start slightly below and fade in)
  //     gsap.set(words, { opacity: 0, y: 20 });
  //
  //     // timeline controlled by ScrollTrigger: scrub ties the timeline progress to scroll position
  //     // compute a scroll distance proportional to the number of words so the stagger has room to play
  //     const estimatedScroll = Math.min(1200, 200 + words.length * 18); // pixels
  //     // keep the section pinned a little longer after the animation completes
  //     const extraHold = 300; // extra pixels to remain pinned after the reveal finishes
  //     const totalScroll = estimatedScroll + extraHold;
  //
  //     const tl = gsap.timeline({
  //       scrollTrigger: {
  //         // pin the whole showcase wrapper (so the placeholder stays visible while text animates)
  //         trigger: wrapperRef.current,
  //         // pin the full-viewport container so nothing else is visible while the animation runs
  //         start: "top top",
  //         end: `+=${totalScroll}`,
  //         scrub: 0.2, // link animation progress to scrolling; use a small smoothing value
  //         pin: true,
  //         pinSpacing: true,
  //         // markers: true, // uncomment for debugging
  //       },
  //     });
  //
  //     tl.to(words, {
  //       opacity: 1,
  //       y: 0,
  //       stagger: { each: 0.035, from: "start" },
  //       duration: 0.2,
  //       ease: "none", // keep a linear mapping between scroll position and animation progress
  //     });
  //
  //     return () => {
  //       // cleanup timeline and ScrollTrigger when component unmounts
  //       try {
  //         if (tl && tl.scrollTrigger) tl.scrollTrigger.kill();
  //         tl.kill();
  //       } catch (e) {
  //         /* ignore cleanup errors */
  //       }
  //     };
  //   }, []);
  //
  //   // reveal animation specifically for the picture further down the section
  //   useEffect(() => {
  //     if (typeof window === "undefined") return;
  //     if (!picRef.current) return;
  //
  //     const mm = window.matchMedia && window.matchMedia("(max-width: 767px)");
  //     const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  //     if ((mm && mm.matches) || (reduce && reduce.matches)) {
  //       // make sure picture is visible when animations are disabled
  //       const el = picRef.current as HTMLElement;
  //       el.style.opacity = "1";
  //       el.style.transform = "none";
  //       return;
  //     }
  //
  //     const el = picRef.current as HTMLElement;
  //     gsap.set(el, { opacity: 0, y: 20 });
  //
  //     const trig = ScrollTrigger.create({
  //       trigger: picRef.current,
  //       start: "top 80%",
  //       end: "bottom 20%",
  //       onEnter: () => {
  //         gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  //       },
  //       onEnterBack: () => {
  //         gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  //   },
  //     });
  //
  //     return () => {
  //       try {
  //         trig.kill();
  //       } catch (e) {
  //         /* ignore */
  //       }
  //     };
  //   }, []);
  //
  //   // reveal animation for the main info block (heading, paragraph, buttons, stats)
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (!revealRef.current) return;
  //
  //   const mm = window.matchMedia && window.matchMedia("(max-width: 767px)");
  //   const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  //   if ((mm && mm.matches) || (reduce && reduce.matches)) {
  //     const elms = revealRef.current.querySelectorAll<HTMLElement>(".animate-item");
  //     elms.forEach((el) => {
  //       el.style.opacity = "1";
  //       el.style.transform = "none";
  //     });
  //     return;
  //   }
  //
  //     const elms = revealRef.current.querySelectorAll<HTMLElement>(".animate-item");
  //     if (!elms || elms.length === 0) return;
  //
  //     gsap.set(elms, { opacity: 0, y: 20 });
  //
  //     const trig = ScrollTrigger.create({
  //       trigger: revealRef.current,
  //       start: "top 80%",
  //       end: "bottom 20%",
  //       onEnter: () => {
  //         gsap.to(elms, {
  //           opacity: 1,
  //           y: 0,
  //           duration: 0.6,
  //           stagger: 0,
  //           ease: "power2.out",
  //         });
  //       },
  //       onEnterBack: () => {
  //         gsap.to(elms, {
  //           opacity: 1,
  //           y: 0,
  //           duration: 0.6,
  //           stagger: 0,
  //           ease: "power2.out",
  //         });
  //       },
  //     });
  //
  //     return () => {
  //       try {
  //         trig.kill();
  //       } catch (e) {
  //         /* ignore */
  //       }
  //     };
  //   }, []);

  // keywords to highlight inside the paragraph
  const gradientKeywords: Set<string> = new Set([]);
  const primaryKeywords = new Set([
    "members",
    "partnerships",
    "collaboration",
    "mentorship",
    "opportunities",
    "solutions",
    "entrepreneurial",
    "tumai",
    "ai",
    "research",
    "projects",
    "startups",
    "workshops",
  ]);

  return (
    <div className="flex flex-col gap-8 min-h-screen p-8 md:p-10">
      <div className="w-full flex min-h-[350px] items-center md:max-h-2/3 flex-1">
        <img
          className="object-cover min-h-[350px]  bg-gray-200 rounded-xl"
          src="/assets/apply/new_section_photo_1.jpg"
          alt="TUM.ai members"
        />
      </div>
      <div
        className="flex flex-wrap md:min-h-1/3 my-2 w-full justify-between"
        ref={revealRef}
      >
        <div className="flex flex-col w-full md:w-3/6 text-start md:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
              What is <span className="gradient-text font-bold">TUM.ai</span>
              {"?"}
            </h1>
            <p className="text-xl md:text-2xl animate-item">
              With over 90 active members, TUM.ai empowers the next generation
              of AI innovators. Founded in 2020, our mission is to create
              <span className="text-primary font-bold">
                {" "}
                a community of students who innovate, research, and build at the
                forefront of AI
              </span>
              , fostering both groundbreaking research and entrepreneurial
              ventures across diverse industries.
            </p>
            <Button
              asChild
              variant="primary"
              className="w-full rounded-md px-6 py-3 mt-4 mb-6 md:mb-0 text-center md:w-auto animate-item"
            >
              <a href="/community#memberStories">Meet our Members</a>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-center-safe items-center w-full md:w-3/7">
          <div className="flex w-full justify-center items-center">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 w-full">
              <div className="animate-item">
                <Stat title={"Alumni Members"} from={0} to={400} suffix="+" />
              </div>
              <div className="animate-item">
                <Stat title={"Founding Year"} from={0} to={2020} suffix="" />
              </div>
              <div className="animate-item">
                <Stat title={"Nationalities"} from={0} to={33} suffix="+" />
              </div>
              <div className="animate-item">
                <Stat title={"Majors"} from={0} to={15} suffix="+" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="hidden md:flex w-full md:flex-row md:pt-16"
        ref={wrapperRef}
      >
        <div
          className="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center"
          ref={textRef}
        >
          <p className="text-lg md:text-2xl text-start md:text-left px-4">
            {"Together with our highly-talented members, we conduct cutting-edge research projects, develop AI-powered solutions with industry partners, incubate innovative startups, and organize workshops that bridge academic knowledge with real-world applications. Through strategic partnerships and connections with leading AI tech and industry companies, we create unique opportunities for collaboration, mentorship, and career development. We aim to lower the entry barriers to AI creation and usage for people from every domain by establishing a platform for practical experience through diverse applied AI projects, research initiatives, and entrepreneurial opportunities."
              .split(" ")
              .map((word, index) => {
                const stripped = word
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toLowerCase();
                const isGradient = gradientKeywords.has(stripped);
                const isPrimary = primaryKeywords.has(stripped);
                const extraClass = isGradient
                  ? "gradient-text font-bold"
                  : isPrimary
                    ? "text-primary font-semibold"
                    : "";
                return (
                  <span
                    key={index}
                    className={`word inline-block ${extraClass}`}
                  >
                    {word}&nbsp;
                  </span>
                );
              })}
          </p>
        </div>
        <div
          ref={picRef}
          className="w-full md:w-2/3 flex items-center justify-center"
        >
          <img
            className="object-cover w-full h-[70vh] rounded-xl"
            src="/assets/apply/new_section_photo_2.jpg"
            alt="TUM.ai members placeholder"
          />
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
    <div
      ref={ref}
      className="flex flex-col justify-start items-center md:items-start"
    >
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
