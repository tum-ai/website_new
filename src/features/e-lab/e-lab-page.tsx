import { FaqSection } from "@tum.ai/ui-kit";
import { eLabCohortNameOf, ventureFundingTextOf } from "@/config/e-lab";
import { getSiteFacts } from "@/config/site-settings-content";
import { ApplicationField } from "./application-field";
import { ClosingSection } from "./closing-section";
import { getELabCopy, getELabFaqs } from "./content";
import { buildStages, gatesOf } from "./data/selection";
import { Hero } from "./hero";
import { InvolveSection } from "./involve-section";
import { PartnersSection } from "./partners-section";
import { SelectionGates } from "./selection-gates";
import { VentureTrace } from "./venture-trace";
import { VoicesSection } from "./voices-section";

/**
 * /e-lab, for founders first and partners second: the program in one
 * sentence, then one cohort drawn as its gates to scale (the page's one bold
 * element), one venture traced through them and the founders of past
 * batches, the program's partners, founders and investors in their own
 * words, the ways for companies to take part, the FAQ, and a close back at
 * the widest gate, the application round. The cohort's figures come from the site facts and its state from
 * the E-Lab window (`getSiteFacts()`, `getELabWindow()`); the copy and the
 * FAQ from the content slice (`content.ts`), the ventures and voices from
 * theirs (`venture-content.ts`): each the CMS or the code. The route renders
 * the JSON-LD from src/config/seo.ts.
 */
export async function ELabPage() {
  const [faq, copy, facts] = await Promise.all([
    getELabFaqs(),
    getELabCopy(),
    getSiteFacts(),
  ]);
  const { selection } = facts.eLab;
  const stages = buildStages(copy.gates.stages, selection);
  const gates = gatesOf(stages);
  return (
    <main>
      <Hero
        copy={copy.hero}
        logo={facts.eLab.heroLogo}
        field={
          <ApplicationField
            gates={gates}
            copy={copy.field}
            cohortName={eLabCohortNameOf(facts.eLab.currentIteration)}
          />
        }
      />
      <SelectionGates
        copy={copy.gates}
        stages={stages}
        applications={selection.applications}
      />
      <VentureTrace
        copy={copy.ventures}
        gates={gates}
        fundingText={ventureFundingTextOf(facts.eLab.ventureFundingMillions)}
      />
      <PartnersSection copy={copy.partners} />
      <VoicesSection copy={copy.voices} />
      <InvolveSection copy={copy.involve} />
      <FaqSection items={faq} tone="lavender" />
      <ClosingSection copy={copy.closing} />
    </main>
  );
}
