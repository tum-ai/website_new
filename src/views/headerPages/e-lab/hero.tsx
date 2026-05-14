import { ELabApplicationCta } from "@/components/e-lab/ApplicationCta";
import { eLabApplicationCopy, eLabConfig } from "@/config/e-lab";

export const Hero = () => {
  return (
    <section className="relative h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-xl"
          style={{
            animation: "floatingPulse 25s ease-in-out infinite",
            animationDelay: "0s",
          }}
        ></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full blur-lg"
          style={{
            animation: "floatingPulse 30s ease-in-out infinite",
            animationDelay: "8s",
          }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-400 rounded-full blur-2xl"
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
                      src={eLabConfig.heroLogo.src}
                      alt={eLabConfig.heroLogo.alt}
                      width={400}
                      height={160}
                      className="h-28 md:h-40 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg text-gray-300">by</span>
                  <img
                    src="/assets/logo_new_white_standard.png"
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
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                Build the next generation of{" "}
                <span className="text-purple-400 font-semibold">
                  AI startups
                </span>{" "}
                in 12 weeks
              </p>
              <p className="text-base text-gray-400">
                Equity-free • Munich-based • Founder-focused
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <ELabApplicationCta
                className="inline-flex items-center justify-center rounded-full px-7 py-2 text-base font-medium transition-colors duration-200 ease-out"
                openClassName="bg-[#9A64D9] text-white shadow-lg shadow-[#9A64D9]/25 hover:bg-[#523573]"
                closedClassName="bg-[#523573]/75 text-[#F5EFFF] ring-1 ring-[#9A64D9]/35 shadow-lg shadow-[#1B0049]/30"
              >
                {eLabApplicationCopy.heroCtaLabel}
              </ELabApplicationCta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
