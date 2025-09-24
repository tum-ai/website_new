import SEO from "@/components/SEO";
import { ExpectationELab } from "@/components/e-lab/ExpectationELab";
import { NotableStartups } from "@/components/e-lab/NotableStartups";
import { Testimonials } from "@/components/e-lab/Testimonials";
import { Timeline } from "@/components/e-lab/TimeLine";
import FAQ from "@/components/ui/FAQ";
import Section from "@/components/ui/Section";
import { getSEOConfig } from "@/config/seo";
import { faq } from "@/data/e-lab/FAQ";
import type { Organization, WithContext } from "schema-dts";
import { Hero } from "./hero";

export default function ELab() {
  const jsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Venture Department",
    alternateName: [
      "AI Entrepreneurship Lab",
      "AI E-Lab",
      "AI E-Lab by TUM.ai",
      "AI Entrepreneurship Lab by TUM.ai",
    ],
    description:
      "The Venture Department is the entrepreneurial arm of TUM.ai and organizes the AI Entrepreneurship Lab, a 14-week equity-free AI startup incubator.",
    url: "https://www.tum-ai.com/e-lab",
    email: "venture@tum-ai.com",
    sameAs: [
      "https://www.startbase.de/organization/ai-e-lab/",
      "https://www.startup-insider.com/investor/ai-e-lab-by-tum-ai",
      "https://www.munich-startup.de/startups/tum-ai-entrepreneurship-lab/",
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "TUM.ai",
      legalName: "TUM.ai e.V.",
      alternateName: "TUM.ai Student Initiative",
      url: "https://www.tum-ai.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/TUM.ai_Logo_Blue_%26_Violet.svg",
      email: "contact@tum-ai.com",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "venture@tum-ai.com",
      contactType: "Venture Department",
    },
  };

  return (
    <>
      <SEO {...getSEOConfig("entrepreneurship")} />
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
      <Hero />

      <ExpectationELab />

      <Testimonials />

      <Timeline />

      <section className="relative overflow-hidden py-12 sm:py-12 lg:py-16 w-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Decorative gradient blobs for depth */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-purple-400/40 to-fuchsia-400/30 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/30 to-sky-400/30 blur-3xl"></div>
        <div className="pointer-events-none absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 blur-3xl"></div>

        <div className="container mx-auto">
          <div className="relative z-10 mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center">
              {/* Main card */}
              <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border-2 border-white/40 bg-white/10 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 transition-transform duration-300 ease-out hover:scale-[1.01] md:hover:scale-[1.02]">
                {/* Liquid glass tint and inner gradient */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-purple-200/25 via-white/10 to-indigo-200/15"></div>
                {/* Inner subtle bevel */}
                <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.12)]"></div>

                {/* Top highlight */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent"></div>

                {/* Left highlight */}
                <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/60 to-transparent"></div>

                {/* Specular reflections */}
                <div className="pointer-events-none absolute -top-20 left-1/4 h-40 w-1/2 rotate-6 rounded-full bg-gradient-to-r from-white/60 to-transparent blur-2xl"></div>
                <div className="pointer-events-none absolute top-1/3 -right-10 h-24 w-72 -rotate-12 rounded-full bg-gradient-to-r from-white/25 to-transparent blur-xl"></div>
                {/* Top-left highlight bubble */}
                <div className="pointer-events-none absolute -top-6 -left-6 h-24 w-32 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.9),_rgba(255,255,255,0.35)_60%,_transparent_70%)] blur-md"></div>
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-900/5 to-transparent"></div>

                <div className="relative px-12 py-18 md:px-18 md:py-20">
                  <div className="text-center">
                    <h2
                      className={`mb-5 text-3xl md:text-4xl font-bold text-black`}
                    >
                      <style></style>
                      Applications for AI E-Lab are now open
                    </h2>

                    <p
                      className={`mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-700`}
                    >
                      Secure your spot in one of Europe’s leading AI incubators
                      and join a network of top founders, mentors, and
                      investors.
                    </p>

                    <div className="flex justify-center">
                      <div className="relative">
                        {/* Radiating glow effect - always visible */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg opacity-50 blur-xl"></div>

                        {/* Sparkling effects - always visible */}

                        <a
                          href="https://tally.so/r/3jVjWa"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 py-3 text-base font-semibold text-white shadow-xl transition-[background-position,transform] duration-500 ease-out hover:scale-[1.02]
                          bg-[linear-gradient(135deg,#7C3AED_0%,#A855F7_33%,#EC4899_66%,#6366F1_100%)] bg-[length:200%_200%] bg-[position:0%_50%] hover:bg-[position:100%_50%]`}
                        >
                          {/* Soft glow behind button */}
                          <div className="pointer-events-none absolute -inset-x-8 -bottom-6 h-16 rounded-full bg-gradient-to-r from-purple-500/40 via-fuchsia-500/40 to-indigo-500/40 blur-2xl"></div>
                          {/* Border and shine */}
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30"></div>
                          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35),_transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                          <span className="relative z-10 flex items-center gap-2">
                            <span>Apply Now</span>
                            <svg
                              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <NotableStartups />

      <FAQ faq={faq}></FAQ>
    </>
  );
}
