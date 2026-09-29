import { deriveSiteFacts } from "@/config/site-facts";
import { getSiteFacts } from "@/config/site-settings-content";
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
 * (`content.ts`, `organization-content.ts`: the CMS or the code), the
 * member figures and the partnership contact from the site facts. The
 * provider shares the finder's answers and the contact with every contact
 * action on the page.
 */
export async function PartnersPage({
  initialPartners = [],
}: {
  initialPartners?: Partner[];
}) {
  const partners = getPartnerDirectory(initialPartners);
  const [copy, logos, profiles, caseStudies, facts] = await Promise.all([
    getPartnersCopy(),
    getPartnerLogos(),
    getPartnerProfiles(),
    getPartnerCaseStudies(),
    getSiteFacts(),
  ]);
  const { intents, durations, recommendations, prompts, sections } = copy;
  return (
    <PartnershipProvider
      copy={{ intents, durations, recommendations, prompts }}
      contact={{
        email: facts.contactEmails.partners,
        bookingUrl: facts.partnershipBooking.bookingUrl,
        bookingHost: facts.partnershipBooking.bookingHost,
      }}
    >
      <main>
        <PartnersHero
          partners={partners}
          logos={logos}
          copy={sections.hero}
          marquee={sections.marquee}
        />
        <FinderSection copy={sections.finder} />
        <ReasonsSection reasons={copy.reasons} copy={sections.reasons} />
        <ProofSection stats={copy.stats} copy={sections.proof} />
        <PillarsSection pillars={copy.pillars} copy={sections.pillars} />
        <PeopleSection
          profiles={profiles}
          alumniDestinations={logos.alumniDestinations}
          members={{
            official: deriveSiteFacts(facts).officialMembers,
            majors: facts.organization.majors,
            universities: facts.organization.universities,
          }}
          copy={sections.people}
        />
        <DirectorySection partners={partners} copy={sections.directory} />
        <CasesSection caseStudies={caseStudies} copy={sections.cases} />
        <ContactSection copy={sections.contact} />
      </main>
    </PartnershipProvider>
  );
}
