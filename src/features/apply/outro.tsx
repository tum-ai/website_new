import { CtaBand, FaqSection, Highlight } from "@/components/ds";
import { ApplyAction } from "./apply-action";
import { faq } from "./data/faq";

/** FAQ, then the closing call to apply (reflects the open/closed state). */
export function Outro() {
  return (
    <>
      <FaqSection id="apply-faq" tone="mist" items={faq} />
      <CtaBand
        titleId="apply-cta-title"
        title={
          <>
            Apply now and join <Highlight>TUM.ai</Highlight>!
          </>
        }
        lead="Together, we shape the AI ecosystem by making AI accessible to everyone in the future. We are excited to have you on board."
        actions={<ApplyAction statusId="apply-cta-status" />}
      />
    </>
  );
}
