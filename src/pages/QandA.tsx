import { cx } from "class-variance-authority";
import { bitter } from "@/styles/fonts";
import FAQ from "@/components/FAQ";

const faq = [
  {
    question: "I don’t feel experienced yet. Should I still apply?",
    answer:
      "Definitely. Our program is designed to equip you with all relevant knowledge and to make your founding experience as convenient as possible.",
  },
  {
    question: "Do I need to be enrolled at a university?",
    answer:
      "No. It doesn't matter whether you are are enrolled at TUM, LMU or a student in Munich at all. We want to make founding accessible to everyone and fair. Regardless of your background, we would like to help you with founding your AI startup. You only have to be present in Munich during the program.",
  },
  {
    question: "My idea is not AI related. Can I still apply?",
    answer:
      "Unfortunately, no. Your startup idea has to be related to artificial intelligence.",
  },
  {
    question: "When will the application phase begin?",
    answer:
      "The application phase will open probably around August 2024 again.",
  },
  {
    question: "Can I apply with a team?",
    answer:
      "Yes, you can, we will consider your application then as a team application.",
  },
  {
    question:
      "What if I don’t find a team during the first week of the AI E-Lab?",
    answer:
      "No worries, if you don’t find a team, you’ll still be able to continue your journey in the E-Lab.",
  },
  {
    question: "Do I have to be located in Munich during the program?",
    answer:
      "Since we organize in-person activities, participants need to be present in Munich during these activities.",
  },
  {
    question: "Am I legally bound to TUM.ai or a partner company?",
    answer:
      "No. We are equity-free and do not want a share in your startup. You only need to invest your dedication and eagerness and we would like to help you with your AI startup.",
  },
  {
    question: "What is the time commitment for this program?",
    answer:
      "The AI E-Lab is a part-time program. Keep in mind that the more you commit, the more you get out of this program.",
  },
];

export default function QandA() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image with Enhanced Effects */}
        <img
          src="/assets/partners.jpg"
          alt="Hero background image"
          className="absolute scale-110 object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        {/* Content Container */}
        <div className="relative container mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center p-8 text-white md:p-16">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-0 h-32 w-1 -translate-y-1/2 bg-linear-to-b from-blue-500 to-purple-500 opacity-50" />

          {/* Main Content */}
          <div className="space-y-6">
            <h1
              className={cx(
                "text-6xl font-medium tracking-tight md:text-7xl",
                "bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent",
                "animate-fade-in-up",
              )}
              style={{ fontFamily: bitter }}

            >
              Q & A
            </h1>
          </div>
        </div>
      </section>

      <section className="relative bg-linear-to-b from-blue-700 to-blue-800 p-8 text-white sm:py-16 lg:py-32">
        <div className="container mx-auto">
          <div className="mx-auto max-w-7xl">
            {/* Background dots pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-8 opacity-10">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-purple-300" />
                ))}
              </div>
            </div>

            <div className="relative mb-16 flex flex-col items-center text-center">
              <h2
                className="mb-6 text-2xl font-semibold text-white"
                style={{ fontFamily: bitter }}
              >
                <FAQ questions={faq}></FAQ>
              </h2>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
