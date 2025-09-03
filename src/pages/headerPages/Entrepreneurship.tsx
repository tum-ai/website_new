import { cx } from "class-variance-authority";

export default function Entrepreneurship() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image with Enhanced Effects */}
        <img
          src="/assets/home_img4.jpg"
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
            >
              E-Lab
            </h1>
          </div>
        </div>
      </section>

      <section className="relative bg-white p-8 sm:py-16 lg:py-32">
        <div className="container mx-auto">
          <h2 className="text-uppercase mb-8 w-full text-3xl font-semibold">
            Information about E-Lab
          </h2>
        </div>
      </section>
    </>
  );
}
