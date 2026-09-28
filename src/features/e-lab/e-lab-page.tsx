import { CtaBand, FaqSection } from "@/components/ds";
import { eLabApplicationCopy, eLabPhaseCopy } from "@/config/e-lab";
import { ELabApplicationCta, ELabApplicationStatus } from "./application-cta";
import { faq } from "./data/faq";
import { ELabPhase } from "./e-lab-phase";
import { ExpectationELab } from "./expectation-e-lab";
import { Hero } from "./hero";
import { NotableStartups } from "./notable-startups";
import { ProgramTimeline } from "./program-timeline";
import { Testimonials } from "./testimonials";

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
 * copy and state comes from src/config/e-lab.ts; the route renders the
 * JSON-LD from src/config/seo.ts.
 */
export function ELabPage() {
  return (
    <main>
      <Hero />

      <ExpectationELab />

      <Testimonials />

      <ProgramTimeline />

      <NotableStartups />

      <FaqSection items={faq} tone="lavender" />

      <CtaBand
        titleId="elab-apply-title"
        eyebrow={eLabApplicationCopy.cohortName}
        title={
          <ELabPhase
            open={<KeepCohortTogether text={eLabPhaseCopy.open.cardHeading} />}
            closed={
              <KeepCohortTogether text={eLabPhaseCopy.closed.cardHeading} />
            }
          />
        }
        lead={
          <ELabPhase
            open={eLabPhaseCopy.open.cardDescription}
            closed={eLabPhaseCopy.closed.cardDescription}
          />
        }
        actions={
          <>
            <ELabApplicationCta label="card" />
            <ELabApplicationStatus />
          </>
        }
      />
    </main>
  );
}
