import { AboutSection } from "@/components/home/AboutSection";
import { ForCompaniesSection } from "@/components/home/ForCompaniesSection";
import {
  InitiativePartnersSection,
  PartnersSection,
} from "@/components/home/PartnersSection";
import { ProgramsSection } from "@/components/home/ProgramsSection";
import { SlackSection } from "@/components/home/SlackSection";
import type { Organization, WithContext } from "schema-dts";
import { Hero } from "../components/ui/hero";

const metadata = {
  title: "TUM.ai - Student Initiative focused on Artificial Intelligence",
  description:
    "TUM.ai is a student initiative based at the Technical University of Munich. We connect students and all relevant stakeholders to facilitate the application of AI across domains to drive positive societal impact through interdisciplinary projects. Together with our highly talented members, we organize Hackathons, Working Student Positions, Research Projects, Lectures, Workshops, Conferences and a Startup Incubator around Artificial Intelligence.",
};

// JSON-LD data for SEO
const jsonLd: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TUM.ai",
  legalName: "TUM.ai e.V.",
  alternateName: ["TUM.ai Student Initiative"],
  description:
    "TUM.ai is a student initiative based at the Technical University of Munich. We connect students and all relevant stakeholders to facilitate the application of AI across domains to drive positive societal impact through interdisciplinary projects. Together with our highly talented members, we organize Hackathons, Working Student Positions, Research Projects, Lectures, Workshops, Conferences and a Startup Incubator around Artificial Intelligence.",
  url: "https://www.tum-ai.com",
  logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/TUM.ai_Logo_Blue_%26_Violet.svg",
  sameAs: [
    "https://www.linkedin.com/company/tum-ai",
    "https://www.instagram.com/tum.ai_official/",
    "https://www.facebook.com/p/Tumai-100064870068663/",
    "https://x.com/TUMai_official",
    "https://www.youtube.com/@tum.aistudentinitiative",
    "http://www.wikidata.org/entity/Q128339659",
    "https://github.com/tum-ai",
    "https://www.crunchbase.com/organization/tum-ai",
    "https://www.reddit.com/r/TUM_ai/",
    "https://www.tiktok.com/@tum.ai_",
    "https://tum-ai.podbean.com/",
    "https://theorg.com/org/tum-ai",
    "https://www.eventbrite.de/o/tumai-31793295023",
  ],
  email: "contact@tum-ai.com",
  foundingDate: "2020",
  foundingLocation: "Munich, Germany",
  location: [
    {
      "@type": "PostalAddress",
      streetAddress: "Rosenheimer Str. 116A",
      postalCode: "81669",
      addressLocality: "Munich",
      addressCountry: "Germany",
      contactType: "Headquarters",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Arcisstraße 21",
      postalCode: "80333",
      addressLocality: "Munich",
      addressCountry: "Germany",
      contactType: "Registered office",
    },
  ],
  identifier: {
    "@type": "PropertyValue",
    name: "Register of Associations",
    value: "VR 210726",
  },
  department: [
    {
      "@type": "Organization",
      name: "Venture Department",
      description:
        "The Venture Department is the entrepreneurial arm of TUM.ai and organizes the AI Entrepreneurship Lab, a 14-week equity-free AI startup incubator.",
      url: "https://www.tum-ai.com/e-lab",
      contactPoint: {
        "@type": "ContactPoint",
        email: "venture@tum-ai.com",
        contactType: "Venture Department",
      },
      employee: {
        "@type": "EmployeeRole",
        roleName: "Head of Venture Department",
        employee: {
          "@type": "Person",
          name: "Laurenz Sommerlad",
          identifier: "laurenz-sommerlad",
          email: "laurenz.sommerlad@tum-ai.com",
          url: "https://www.tum-ai.com/e-lab/laurenz-sommerlad",
          sameAs: [
            "https://laurenzsommerlad.com",
            "https://www.linkedin.com/in/laurenzsommerlad/",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            email: "laurenz.sommerlad@tum-ai.com",
            contactType: "Head of Venture Department",
          },
        },
      },
    },
    // ... other departments
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "partners@tum-ai.com",
    contactType: "partner and sponsorship inquiries",
  },
};

export default function Homepage() {
  return (
    <>
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>

      <Hero />
      <ProgramsSection />
      <AboutSection />
      <ForCompaniesSection />
      <PartnersSection />
      <InitiativePartnersSection />
      <SlackSection />
    </>
  );
}
