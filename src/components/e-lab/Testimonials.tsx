import Section from "../ui/Section";

export const Testimonials = () => {
  return (
    <Section className="flex flex-col items-center justify-center py-12 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white w-full">
      <h2
        className={`text-3xl md:text-4xl tracking-tight font-semibold mb-4 text-black text-center uppercase `}
      >
        Our Community
      </h2>
      <p className={`text-base text-gray-600 mt-4 mb-10 text-center`}>
        Hear more from voices from our network
      </p>

      {/* Animated Cards Container */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none"></div>
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 bg-gradient-to-l from-white via-gray-50/70 to-transparent z-10 pointer-events-none"></div>
        <div className="flex animate-scroll-left space-x-6 px-4">
          {/* Card 1 - Leon Hergert */}
          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/leon_hergert.png"
                  alt="Leon Hergert"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Leon Hergert
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Co-Founder @ Spherecast
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 1.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "The AI E-Lab gave us the foundation to build Spherecast from idea
              to YC. The community and mentorship were game-changing."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/YC.png"
                  alt="Y Combinator"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>Y Combinator S24</span>
            </div>
          </div>

          {/* Card 2 - Benedikt Wieser */}
          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/benedikt_wieser.png"
                  alt="Benedikt Wieser"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Benedikt Wieser
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Winner AI E-Lab 2.0
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 2.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "The AI E-Lab is probably the best program for creating top-end
              entrepreneurs out there. It's simply incredible."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/CDTM.png"
                  alt="CDTM"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>CDTM Alumni</span>
            </div>
          </div>

          {/* Card 3 - Leonardo Benini */}
          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/leonardo_benini.png"
                  alt="Leonardo Benini"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Leonardo Benini
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Founder @ Stealth Startup
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 3.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "Structured, fast, and insanely effective. Every founder should
              experience this."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/ewor.png"
                  alt="EWOR"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>EWOR Fellow</span>
            </div>
          </div>

          {/* Card 4 - Oliver Schoppe */}
          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/oliver_schoppe.png"
                  alt="Oliver Schoppe"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Oliver Schoppe
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Principal @ UVC Partners
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  Mentor & Investor
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "The quality of founders coming out of AI E-Lab is exceptional.
              We're proud to be part of this community."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/uvc_b.png"
                  alt="UVC Partners"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>UVC Partners</span>
            </div>
          </div>

          {/* Card 5 - Viktor Shen */}
          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/viktor_shen.jpeg"
                  alt="Viktor Shen"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Viktor Shen
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Founder of Tenmin
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 3.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "We went from zero to being a funded startup - the AI E-Lab
              accelerated our journey far beyond what we thought was possible."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/tenmin.svg"
                  alt="Tenmin AI"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>Tenmin AI</span>
            </div>
          </div>

          {/* Duplicate cards for seamless loop */}
          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/leon_hergert.png"
                  alt="Leon Hergert"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Leon Hergert
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Co-Founder @ Spherecast
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 1.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "The AI E-Lab gave us the foundation to build Spherecast from idea
              to YC. The community and mentorship were game-changing."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/YC.png"
                  alt="Y Combinator"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>Y Combinator S24</span>
            </div>
          </div>

          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/benedikt_wieser.png"
                  alt="Benedikt Wieser"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Benedikt Wieser
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Winner AI E-Lab 2.0
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 2.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "The AI E-Lab is probably the best program for creating top-end
              entrepreneurs out there. It's simply incredible."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/CDTM.png"
                  alt="CDTM"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>CDTM Alumni</span>
            </div>
          </div>

          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/leonardo_benini.png"
                  alt="Leonardo Benini"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Leonardo Benini
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Founder @ Stealth Startup
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 3.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "We went from zero to being a funded startup - the AI E-Lab
              accelerated our journey far beyond what we thought was possible."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/ewor.png"
                  alt="EWOR"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>EWOR Fellow</span>
            </div>
          </div>

          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/oliver_schoppe.png"
                  alt="Oliver Schoppe"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Oliver Schoppe
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Principal @ UVC Partners
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  Mentor & Investor
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "The quality of founders coming out of AI E-Lab is exceptional.
              We're proud to be part of this community."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/uvc_b.png"
                  alt="UVC Partners"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>UVC Partners</span>
            </div>
          </div>

          {/* Card 5 - Viktor Shen */}
          <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-72">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
                <img
                  src="/assets/e-lab/testimonials/viktor_shen.jpeg"
                  alt="Viktor Shen"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg text-gray-900 truncate`}>
                  Viktor Shen
                </h3>
                <p className={`text-sm text-gray-600 truncate`}>
                  Founder of Tenmin
                </p>
                <p className={`text-xs text-purple-600 font-medium`}>
                  AI E-Lab 3.0
                </p>
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm leading-relaxed flex-1 overflow-hidden`}
            >
              "We went from zero to being a funded startup - the AI E-Lab
              accelerated our journey far beyond what we thought was possible."
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/assets/e-lab/partners/tenmin.svg"
                  alt="Tenmin AI"
                  width={32}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className={`text-xs text-gray-500`}>Tenmin AI</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
