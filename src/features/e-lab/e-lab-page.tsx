import { FaqSection } from "@/components/ds";
import { ClosingSection } from "./closing-section";
import { getELabCopy, getELabFaqs } from "./content";
import { buildStages } from "./data/selection";
import { Hero } from "./hero";
import { SelectionGates } from "./selection-gates";
import { VentureTrace } from "./venture-trace";
import { VoicesSection } from "./voices-section";

/**
 * /e-lab, for founders first and partners second: the program in one
 * sentence, then one cohort drawn as its gates to scale (the page's one bold
 * element), one venture traced through them, founders and investors in their
 * own words, the FAQ, and a close back at the widest gate, the application
 * round. The cohort's state and figures come from src/config/e-lab.ts; the
 * copy and the FAQ from the content slice (`content.ts`: the CMS or the code
 * copy); the route renders the JSON-LD from src/config/seo.ts.
 */
export async function ELabPage() {
  const [faq, copy] = await Promise.all([getELabFaqs(), getELabCopy()]);
  return (
    <main>
      <Hero copy={copy.hero} />
      <SelectionGates
        copy={copy.gates}
        stages={buildStages(copy.gates.stages)}
      />
      <VentureTrace />
      <VoicesSection />
      <FaqSection items={faq} tone="lavender" />
      <ClosingSection />
    </main>
  );
}
