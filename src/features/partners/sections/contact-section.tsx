import { CtaBand } from "@/components/ds";
import { ContactActions } from "../contact-actions";
import type { PartnersSections } from "../data/partners";
import { BatchRow } from "./batch-row";
import { Lines } from "./lines";

/**
 * Closing call to action on ink. Its artwork answers the selection field:
 * the admitted of one round, lit in a row, the people a partner meets.
 * `#partner-contact` is the header CTA's target on this page, so it lands
 * below the fixed header.
 */
export function ContactSection({
  admitted,
  copy,
}: {
  /** Members one round admits, from the render's site facts. */
  admitted: number;
  copy: PartnersSections["contact"];
}) {
  return (
    <CtaBand
      variant="band"
      mark={false}
      id="partner-contact"
      titleId="partner-final-title"
      className="scroll-mt-header"
      visual={<BatchRow admitted={admitted} />}
      title={<Lines lines={copy.title} />}
      lead={<Lines lines={copy.lead} />}
      classNames={{ title: "text-highlight" }}
    >
      <ContactActions
        bookingFirst
        emailLabel={copy.emailLabel}
        size="lg"
        align="center"
      />
    </CtaBand>
  );
}
