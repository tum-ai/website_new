import Benefits from "@/components/Benefit";
import { Button } from "@/components/ui/button";
import {
  VCPartners,
  industryPartners,
  initiativePartners,
  // longtermPartners,
  researchPartners,
  technicalPartners,
} from "@/data/partners";
import { cx } from "class-variance-authority";
import { Brain, Handshake, Megaphone, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { getSEOConfig } from "@/config/seo";
import Layout from "@/components/Layout";


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
      <SEO {...getSEOConfig("partners")} />
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src="/assets/partners.webp"
          alt="Hero background image"
          className="absolute w-full h-full object-cover scale-110 transition-transform duration-700 hover:scale-105"
        />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero content */}
        <div className="relative container mx-auto px-8 text-center z-10">
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent
                    bg-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
          >
            Partners & Sponsors
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Get access to Germany&apos;s largest student talent pool of AI enthusiasts
          </p>
          <a href="mailto:partners@tum-ai.com">
            <Button className="mt-8 px-8 py-4 text-lg">Become a Partner</Button>
          </a>
        </div>
      </section >

      <div>
        {/* PARTNER LOGOS */}
        <Layout>
        <section className="p-8 md:p-10 sm:py-16 lg:py-16 text-center md:text-start px-[1rem]">
          <div className="container mx-auto space-y-16 justify-center md:justify-start items-center md:items-start">
            {/* <PartnerSection title="Long-Term Partnerships" logos={longtermPartners} /> */}
            <PartnerSection title="Technical Partners" logos={technicalPartners} />
            <PartnerSection title="Industry Partners" logos={industryPartners} />
            <PartnerSection title="Research Partners" logos={researchPartners} />
            <PartnerSection title="Venture Capital" logos={VCPartners} />
            <PartnerSection title="Initiatives" logos={initiativePartners} />
          </div>
        </section>
        </Layout>


        {/* COLLABORATION OPPORTUNITIES */}
        <section className="relative bg-gradient-to-b from-blue-50 to-purple-50 p-8 sm:py-16 lg:py-32 text-gray-800">
          <Layout>
          <div className="container mx-auto flex flex-col lg:flex-row gap-12 items-start">
            {/* Info Card */}
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-semibold text-gray-900">Partner with TUM.ai</h2>
              <p className="max-w-lg text-gray-700">
                Access our exclusive talent pool of AI enthusiasts, experienced
                in software development, data science, and AI strategy.
              </p>

              <div className="grid gap-8 md:grid-cols-2">
                <OpportunityCard
                  title="Events & Community"
                  items={[
                    "AI Summit Speaker",
                    "Makeathon Challenge",
                    "Workshop Host",
                    "Mentorship Program",
                  ]}
                />
                <OpportunityCard
                  title="Industry & Projects"
                  items={[
                    "Industry Project Partner",
                    "AI E-lab Judge",
                    "Post Open Positions",
                  ]}
                />
              </div>

              <OpportunityCard
                title="Education & Knowledge"
                items={[
                  "AI Academy Lecturer",
                  "Technical Workshop Leader",
                  "Research Collaboration",
                ]}
              />

              <a href="mailto:partners@tum-ai.com">
                <Button variant="primary" className="mt-6 w-full border border-gray-300">
                  Become a Partner
                </Button>
              </a>
            </div>

            {/* Visual Image */}
            <div className="flex-1 relative rounded-xl overflow-hidden shadow-lg">
              <img
                src="/assets/partners/martin_talk.jpg"
                alt="Martin talk"
                className="w-full h-full object-cover rounded-xl transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white font-semibold text-lg">
                Join our network of industry leaders and innovators
              </div>
            </div>
          </div>
          </Layout>

        </section>

        {/* BENEFITS */}
        <section className="p-8 sm:py-16 lg:py-32">
          <div className="container mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-12 text-gray-900">What We Offer</h2>
            <Benefits benefits={benefits} showShadow columns={4} color="purple" />
          </div>
        </section>
      </div>

    </>
  );
}

// Partner logos reusable section
function PartnerSection({
  title,
  logos,
}: {
  title: string;
  logos: { href: string, alt: string; src: string }[];
}) {
  return (
    <div>
      <h3
        className={cx(
          "text-2xl font-semibold mb-6 bg-clip-text text-transparent",
          "bg-gradient-to-r from-purple-700 via-pink-600 to-red-600"
        )}
      >
        {title}
      </h3>
      <div className="flex flex-wrap items-center justify-center md:items-start md:justify-start gap-2">
        {logos.map((logo) => (
          <div
            key={logo.alt}
            // Set a fixed height for the card
            className="flex h-20 w-40 items-center justify-center rounded-lg border-1 bg-white p-4 py-6"
          >
            {/* Limit logo size and maintain aspect ratio */}
            <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
// Opportunity card component
function OpportunityCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      <ul className="space-y-2 text-gray-700 text-sm">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-purple-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

