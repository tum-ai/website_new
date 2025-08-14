import { motion } from "framer-motion";

export const Hero = () => {
  const staggerDelay = 0.1;
  return (
    <section className="relative h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-xl"
          style={{
            animation: 'floatingPulse 25s ease-in-out infinite',
            animationDelay: '0s'
          }}
        ></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full blur-lg"
          style={{
            animation: 'floatingPulse 30s ease-in-out infinite',
            animationDelay: '8s'
          }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-400 rounded-full blur-2xl"
          style={{
            animation: 'floatingPulse 35s ease-in-out infinite',
            animationDelay: '15s'
          }}
        ></div>

      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full w-full text-white">
        <div className="max-w-6xl mx-auto text-center p-8 flex flex-col justify-between h-full">

          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center space-y-8" style={{ marginTop: '-48px' }}>
            {/* Sphere and Title */}
            <div className="flex flex-col items-center space-y-4 pt-8">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="h-28 md:h-40 flex items-center">
                    <img
                      src="assets/e-lab/ai-e-lab-logo.png"
                      alt="AI E-LAB 4.0"
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
                Build the next generation of <span className="text-purple-400 font-semibold">AI startups</span> in 12 weeks
              </p>
              <p className="text-base text-gray-400">
                Equity-free • Munich-based • Founder-focused
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <a
                href="https://forms.tum-ai.com/ai-e-lab-3.0-application"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-7 py-2 text-base font-normal text-white transition-all duration-300 ease-out"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/25 transition-all duration-300 group-hover:shadow-purple-500/40 group-hover:scale-105"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <span className="relative flex items-center space-x-2">
                  <span>AI E-Lab 4.0 - Apply Now</span>
                  <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Sponsor section - positioned at bottom */}
          <div className="mb-16 pt-5">
            <p className="text-sm text-gray-400 mb-4">Sponsored by</p>
            <div className="flex items-center justify-center space-x-6 opacity-70">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10 hover:bg-white/20 transition-all duration-300">
                <img
                  src="/assets/e-lab/partners/picus_w.png"
                  alt="Picus"
                  width={60}
                  height={30}
                  className="h-5 w-auto object-contain"
                />
              </div>
              <div className="flex items-center space-x-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10 hover:bg-white/20 transition-all duration-300">
                  <img
                    src="/assets/e-lab/partners/uvc_w.svg"
                    alt="UVC Partners"
                    width={60}
                    height={30}
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10 hover:bg-white/20 transition-all duration-300">
                  <img
                    src="/assets/e-lab/partners/cherry_w.png"
                    alt="Cherry Ventures"
                    width={60}
                    height={30}
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10 hover:bg-white/20 transition-all duration-300">
                  <img
                    src="/assets/e-lab/partners/hv_w.png"
                    alt="HV Capital"
                    width={60}
                    height={30}
                    className="h-5 w-auto object-contain"
                  />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10 hover:bg-white/20 transition-all duration-300">
                <img
                  src="/assets/e-lab/partners/lovable_w.png"
                  alt="Lovable"
                  width={60}
                  height={30}
                  className="h-5 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute right-0 bottom-8 left-0 flex justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: staggerDelay * 3, ease: "easeOut" }}
      >
        <motion.button
          className="group flex !rounded-full !border !border-white/20 !bg-white/10 !p-0 !h-10 !w-10 !items-center !justify-center"
          onClick={() =>
            window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
          }
          title="Scroll down"
          whileHover={{ y: 3 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, 10, 0] }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              repeatDelay: 1,
            },
          }}
        >
          <svg
            className="h-4 w-4 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
};