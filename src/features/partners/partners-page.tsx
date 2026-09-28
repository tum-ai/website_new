import type { Partner } from "@/lib/types";
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
 * provider shares the finder's answers with every contact action on the page.
 */
export function PartnersPage({
  initialPartners = [],
}: {
  initialPartners?: Partner[];
}) {
  const partners = getPartnerDirectory(initialPartners);
  return (
    <PartnershipProvider>
      <main>
        <PartnersHero partners={partners} />
        <FinderSection />
        <ReasonsSection />
        <ProofSection />
        <PillarsSection />
        <PeopleSection />
        <DirectorySection partners={partners} />
        <CasesSection />
        <ContactSection />
      </main>
    </PartnershipProvider>
  );
}
