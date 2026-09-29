import type { Partner } from "@/lib/types";
import {
  getPartnerCaseStudies,
  getPartnerProfiles,
  getPartnersCopy,
} from "./content";
import { getPartnerLogos } from "./organization-content";
import { getPartnerDirectory } from "./partner-directory";
import { PartnershipProvider } from "./partnership-context";
import { CasesSection } from "./sections/cases-section";
import { ContactSection } from "./sections/contact-section";
import { DirectorySection } from "./sections/directory-section";
import { FinderSection } from "./sections/finder-section";
import { PartnersHero } from "./sections/partners-hero";
import { PeopleSection } from "./sections/people-section";
import { PillarsSection } from "./sections/pillars-section";
import { ProofSection } from "./sections/proof-section";
import { ReasonsSection } from "./sections/reasons-section";

/**
 * The /partners page. `initialPartners` are the CMS partners (empty when the
 * CMS is unavailable); they are merged over the curated launch partners. The
 * copy, case studies, profiles and logos come from the content slices
 * (`content.ts`, `organization-content.ts`: the CMS or the code). The
 * provider shares the finder's answers with every contact action on the page.
 */
export async function PartnersPage({
  initialPartners = [],
}: {
  initialPartners?: Partner[];
}) {
  const partners = getPartnerDirectory(initialPartners);
  const [copy, logos, profiles, caseStudies] = await Promise.all([
    getPartnersCopy(),
    getPartnerLogos(),
    getPartnerProfiles(),
    getPartnerCaseStudies(),
  ]);
  const { intents, durations, recommendations } = copy;
  return (
    <PartnershipProvider copy={{ intents, durations, recommendations }}>
      <main>
        <PartnersHero partners={partners} logos={logos} />
        <FinderSection />
        <ReasonsSection reasons={copy.reasons} />
        <ProofSection stats={copy.stats} />
        <PillarsSection pillars={copy.pillars} />
        <PeopleSection
          profiles={profiles}
          alumniDestinations={logos.alumniDestinations}
        />
        <DirectorySection partners={partners} />
        <CasesSection caseStudies={caseStudies} />
        <ContactSection />
      </main>
    </PartnershipProvider>
  );
}
