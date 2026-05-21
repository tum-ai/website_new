export const Hero = () => {
  return (
    <section className="relative h-screen bg-gradient-to-br from-dark-purple via-[#220836] to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-xl"
          style={{
            animation: "floatingPulse 25s ease-in-out infinite",
            animationDelay: "0s",
          }}
        ></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-dark-purple/50 rounded-full blur-lg"
          style={{
            animation: "floatingPulse 30s ease-in-out infinite",
            animationDelay: "8s",
          }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-400/60 rounded-full blur-2xl"
          style={{
            animation: "floatingPulse 35s ease-in-out infinite",
            animationDelay: "15s",
          }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full w-full text-white">
        <div className="max-w-6xl mx-auto text-center p-8 flex flex-col justify-between h-full">
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {/* Sphere and Title */}
            <div className="flex flex-col items-center space-y-4 pt-8">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="h-28 md:h-40 flex items-center">
                    <img
                      src="/assets/e-lab/E-Lab5Logo.svg"
                      alt="E-LAB 5.0"
                      width={400}
                      height={160}
                      className="h-28 md:h-40 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg text-minimal-gray">by</span>
                  <img
                    src="/assets/tum_ai_logo_new.svg"
                    alt="TUM.ai Logo"
                    width={100}
                    height={35}
                    className="h-7 w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="max-w-2xl mx-auto space-y-2">
              <p className="text-lg md:text-xl text-minimal-gray leading-relaxed">
                Build the next generation of{" "}
                <span className="text-primary font-semibold">AI startups</span>{" "}
                in 12 weeks
              </p>
              <p className="text-base text-white/60">
                Equity-free • Munich-based • Founder-focused
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <a
                href="https://tally.so/r/44KJYb"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-7 py-2 text-base font-normal text-minimal-gray/80 bg-dark-purple/40 border border-dark-purple/50 rounded-full cursor-not-allowed pointer-events-none"
              >
                <span className="relative flex items-center space-x-2">
                  <span>Applications Closed</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
