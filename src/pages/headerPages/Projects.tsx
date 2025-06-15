import { bitter } from "@/styles/fonts";
import { cx } from "class-variance-authority";

export default function Projects() {
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
              Innovation Departments and their projects
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
                className="mb-6 text-3xl font-semibold text-white"
                style={{ fontFamily: bitter }}
              >
                Med.ai
              </h2>
            </div>
          </div>
          <div className="relative mb-16 flex flex-col items-center text-center">
            <h2
              className="mb-6 text-3xl font-semibold text-white"
              style={{ fontFamily: bitter }}
            >
              Applied Accelerated Computing
            </h2>
          </div>
          <div className="relative mb-16 flex flex-col items-center text-center">
            <h2
              className="mb-6 text-3xl font-semibold text-white"
              style={{ fontFamily: bitter }}
            >
              Quant Finance
            </h2>
          </div>
          <div className="relative mb-16 flex flex-col items-center text-center">
            <h2
              className="mb-6 text-3xl font-semibold text-white"
              style={{ fontFamily: bitter }}
            >
              Robotics
            </h2>
          </div>
        </div>
      </section>
    </>
  );
}
