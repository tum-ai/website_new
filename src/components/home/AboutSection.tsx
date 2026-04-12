import { aboutText } from "@/data/homepage";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const PRIMARY_KEYWORDS = new Set([
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

const STATS = [
  { title: "Alumni Members", value: "400+" },
  { title: "Founding Year", value: "2020" },
  { title: "Nationalities", value: "33+" },
  { title: "Majors", value: "15+" },
];

export const AboutSection = () => {
  return (
    <div className="flex flex-col gap-8 p-8 md:p-16">
      <div className="flex w-full items-center md:max-h-2/3">
        <Image
          className="h-auto w-full rounded-xl bg-gray-200 object-cover"
          src="/assets/apply/new_section_photo_1.webp"
          alt="TUM.ai members"
          width={1920}
          height={563}
          sizes="(min-width: 1024px) 80rem, 100vw"
        />
      </div>

      <div className="my-2 flex w-full flex-wrap justify-between md:min-h-1/3">
        <div className="flex w-full flex-col text-start md:w-3/6 md:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="text-title font-semibold sm:text-2xl md:text-[2rem]">
              What is <span className="gradient-text font-bold">TUM.ai</span>
              {"?"}
            </h1>
            <p className="text-xl md:text-2xl">
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
            <div className="mb-4 flex flex-col justify-start gap-4 md:flex-row">
              <Button
                asChild
                variant="primary"
                className="w-full rounded-md px-6 py-3 text-center md:w-auto"
              >
                <Link href="/community#memberStories">Meet our Members</Link>
              </Button>

              <Button
                asChild
                variant="outline2"
                className="!text-primary w-full rounded-md px-6 py-3 text-center md:w-auto"
              >
                <Link href="/qanda">More on our Mission</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center-safe md:w-3/7">
          <div className="flex w-full items-center justify-center">
            <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-2">
              {STATS.map((stat) => (
                <div
                  key={stat.title}
                  className="flex flex-col items-center justify-start md:items-start"
                >
                  <div className="text-4xl font-bold">
                    <span className="gradient-text inline-flex items-start justify-start">
                      {stat.value}
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-medium text-gray-600">
                    {stat.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col-reverse gap-8 md:flex-row">
        <div className="flex w-full items-center justify-center md:w-1/2 lg:w-1/3">
          <p className="pr-0 text-start text-lg md:pr-4 md:text-2xl md:text-left">
            {aboutText.split(" ").map((word, index) => {
              const stripped = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
              const extraClass = PRIMARY_KEYWORDS.has(stripped)
                ? "text-primary font-semibold"
                : "";

              return (
                <span key={index} className={`word inline-block ${extraClass}`}>
                  {word}&nbsp;
                </span>
              );
            })}
          </p>
        </div>

        <div className="flex w-full items-center justify-center md:w-2/3">
          <Image
            className="min-h-[200px] rounded-xl bg-gray-200 object-cover"
            src="/assets/homepage/Onboarding25.webp"
            alt="TUM.ai onboarding"
            width={1920}
            height={1280}
            sizes="(min-width: 1024px) 52vw, 100vw"
          />
        </div>
      </div>
    </div>
  );
};
