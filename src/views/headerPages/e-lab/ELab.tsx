import type { Organization, WithContext } from "schema-dts";
import { CtaBand, FaqSection } from "@/components/ds";
import {
  ELabApplicationCta,
  ELabApplicationStatus,
} from "@/components/e-lab/ApplicationCta";
import { ExpectationELab } from "@/components/e-lab/ExpectationELab";
import { NotableStartups } from "@/components/e-lab/NotableStartups";
import { Testimonials } from "@/components/e-lab/Testimonials";
import { Timeline } from "@/components/e-lab/TimeLine";
import JsonLd from "@/components/JsonLd";
import { eLabApplicationCopy } from "@/config/e-lab";
import { faq } from "@/data/e-lab/FAQ";
import { Hero } from "./hero";

/** Keeps "E-Lab 6.0" on one line so display type never breaks at the hyphen. */
function KeepCohortTogether({ text }: { text: string }) {
  const { cohortName } = eLabApplicationCopy;
  const index = text.indexOf(cohortName);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="whitespace-nowrap">{cohortName}</span>
      {text.slice(index + cohortName.length)}
    </>
  );
}

/**
 * /e-lab: ink hero with the cohort lockup and live application status, what
 * to expect with proof points, community voices, the program timeline,
 * alumni ventures, FAQ and the closing application call to action. All cohort
 * copy and state comes from src/config/e-lab.ts.
 */
export default function ELab() {
  const jsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Venture Department",
    alternateName: [
      "AI Entrepreneurship Lab",
      "E-Lab",
      "E-Lab by TUM.ai",
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
    <main>
      <JsonLd data={jsonLd} />
      <Hero />

      <ExpectationELab />

      <Testimonials />

      <Timeline />

      <NotableStartups />

      <FaqSection items={faq} tone="lavender" />

      <CtaBand
        titleId="elab-apply-title"
        eyebrow={eLabApplicationCopy.cohortName}
        title={<KeepCohortTogether text={eLabApplicationCopy.cardHeading} />}
        lead={eLabApplicationCopy.cardDescription}
        actions={
          <>
            <ELabApplicationCta>
              {eLabApplicationCopy.cardCtaLabel}
            </ELabApplicationCta>
            <ELabApplicationStatus />
          </>
        }
      />
    </main>
  );
}
