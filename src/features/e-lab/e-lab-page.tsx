import { FaqSection } from "@/components/ds";
import { ClosingSection } from "./closing-section";
import { faq } from "./data/faq";
import { Hero } from "./hero";
import { SelectionGates } from "./selection-gates";
import { VentureTrace } from "./venture-trace";
import { VoicesSection } from "./voices-section";

/**
 * /e-lab, for founders first and partners second: the program in one
 * sentence, then one cohort drawn as its gates to scale (the page's one bold
 * element), one venture traced through them, founders and investors in their
 * own words, the FAQ, and a close back at the widest gate, the application
 * round. All cohort copy and state comes from src/config/e-lab.ts; the route
 * renders the JSON-LD from src/config/seo.ts.
 */
export function ELabPage() {
  return (
    <main>
      <Hero />
      <SelectionGates />
      <VentureTrace />
      <VoicesSection />
      <FaqSection items={faq} tone="lavender" />
      <ClosingSection />
    </main>
  );
}
