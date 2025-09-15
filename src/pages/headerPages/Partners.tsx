import Benefits from "@/components/Benefit";
import Logos from "@/components/Logos";
import { Button } from "@/components/ui/button";
import {
  VCPartners,
  industryPartners,
  initiativePartners,
  longtermPartners,
  researchPartners,
  technicalPartners,
} from "@/data/partners";
import { cx } from "class-variance-authority";
import { Brain, Handshake, Megaphone, Users } from "lucide-react";

export const metadata = {
  title: "TUM.ai - Partners",
  description:
    "Is your company currently facing challenges with data-driven technologies or you are looking for the greatest talent in artificial intelligence? If one of the answers is yes, become a partner.",
};

export default function Partners() {
  const benefits = [
    {
      title: "AI Talent Pool",
      text: "Connect with motivated AI students for internships or working roles.",
      icon: Brain,
    },
    {
      title: "Marketing & Awareness",
      text: "Boost your brand through our website and campaigns (14k+ followers).",
      icon: Megaphone,
    },
    {
      title: "Project Collaborations",
      text: "Join Hackathons, research, or industry projects with our members.",
      icon: Handshake,
    },
    {
      title: "Network & Ecosystem",
      text: "Tap into AI startups, R&D insights, and Germany's leading AI student community.",
      icon: Users,
    },
  ];

  return (
    <>
      <section className="pt-16 relative overflow-hidden">
        <img
          src="/assets/partners.webp"
          alt="Hero background image"
          className="absolute w-full h-full scale-110 object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        {/* Content */}
        <div className="relative container mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center p-8 text-white md:p-16">
          <div className="space-y-6">
            <h1
              className={cx(
                "text-title font-medium tracking-tight md:text-7xl",
                "bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent",
                "animate-fade-in-up",
              )}
            >
              Partners & Sponsors
            </h1>
            <p className="animate-fade-in-up text-subtitle text-gray-300 [animation-delay:200ms]">
              Get access to Germany&apos;s largest student talent pool of AI
              enthusiasts
            </p>
            <a href="mailto:partners@tum-ai.com">
              <Button>
                Become a partner
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="relative bg-white p-8 sm:py-16 lg:py-32">
        <div className="container mx-auto">
          {/* <h2 className="mb-8 text-title font-semibold">
            Long-Term Partnerships
          </h2>
          <Logos logos={longtermPartners} /> */}

          <h2 className="mb-8 text-title font-semibold">Technical Partners</h2>
          <Logos logos={technicalPartners} />

          <h2 className="mb-8 text-title font-semibold">Industry Partners</h2>
          <Logos logos={industryPartners} />

          <h2 className="mb-8 text-title font-semibold">Research Partners</h2>
          <Logos logos={researchPartners} />

          <h2 className="mb-8 text-title font-semibold">Venture Capital</h2>
          <Logos logos={VCPartners} />
          <h2 className="mb-8 text-title font-semibold">Initiatives</h2>
          <Logos logos={initiativePartners} />
        </div>
      </section>

      <section
        className="relative bg-linear-to-b from-blue-700 to-blue-800 p-8 text-white sm:py-16 lg:py-32"
        id="become-partner"
      >
        <div className="container mx-auto">
          <div className="mx-auto max-w-7xl">
            <div className="relative mb-16 flex flex-col items-center text-center">
              <h2 className="mb-6 text-title font-semibold text-white">
                Partner with TUM.ai
              </h2>
              <p className="max-w-2xl text-subtitle text-white/90">
                Access our exclusive talent pool of AI enthusiasts, experienced
                in software development, data science, and AI strategy.
              </p>
            </div>

            <div className="relative grid gap-16 md:grid-cols-2">
              <div className="relative">
                <div className="relative space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                  {/* Glass-like top highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                  {/* Glass-like left highlight */}
                  <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-purple-300/50 to-transparent"></div>

                  <div className="space-y-6">
                    <h3 className="text-title font-semibold text-white">
                      Collaboration Opportunities
                    </h3>
                    <p className="text-white/80 text-subtitle">
                      We&apos;re always open to new ideas and creative ways to
                      collaborate.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                        <h4 className="mb-2 font-medium text-white">
                          Events & Community
                        </h4>
                        <ul className="space-y-2 text-sm text-white/80">
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-300" />
                            <span>AI Summit Speaker</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-300" />
                            <span>Makeathon Challenge</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-300" />
                            <span>Workshop Host</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-300" />
                            <span>Mentorship Program</span>
                          </li>
                        </ul>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                        <h4 className="mb-2 font-medium text-white">
                          Industry & Projects
                        </h4>
                        <ul className="space-y-2 text-sm text-white/80">
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-300" />
                            <span>Industry Project Partner</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-300" />
                            <span>AI E-lab Judge</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-purple-300" />
                            <span>Post Open Positions</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-title font-semibold text-white">
                      Education & Knowledge
                    </h3>
                    <ul className="space-y-3 text-base text-white/80">
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-purple-300" />
                        <span>AI Academy Lecturer</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-purple-300" />
                        <span>Technical Workshop Leader</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-purple-300" />
                        <span>Research Collaboration</span>
                      </li>
                    </ul>
                  </div>

                  <a href="mailto:partners@tum-ai.com">
                    <Button
                      variant="primary"
                      className="w-full border border-white/10"
                    >
                      Become a partner
                    </Button>
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="group relative aspect-4/3 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <img
                    src={"/assets/partners/martin_talk.jpg"}
                    alt="Martin talk"
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute right-0 bottom-0 left-0 p-8">
                    <p className="text-lg text-white font-semibold">
                      Join our network of industry leaders and innovators
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white p-8 sm:py-16 lg:py-32">
        <div className="container mx-auto">
          <h2 className="text-uppercase mb-8 w-full text-title font-semibold">
            What we offer
          </h2>
          <Benefits
            benefits={benefits}
            showShadow={true}
            columns={4}
            color="purple"
          />
        </div>
      </section>
    </>
  );
}
