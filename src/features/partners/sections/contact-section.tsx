import { ArrowUpRight } from "lucide-react";
import { CtaBand } from "@/components/ds";
import { ContactActions } from "../contact-actions";
import type { PartnersSections } from "../data/partners";
import { Lines } from "./lines";

/**
 * Closing call to action. `#partner-contact` is the header CTA's target on
 * this page, so it lands below the fixed header.
 */
export function ContactSection({
  copy,
}: {
  copy: PartnersSections["contact"];
}) {
  return (
    <CtaBand
      variant="band"
      id="partner-contact"
      titleId="partner-final-title"
      className="scroll-mt-header"
      visual={
        <div aria-hidden="true" className="inline-block text-highlight">
          <ArrowUpRight className="size-14 md:size-18" strokeWidth={1} />
        </div>
      }
      title={<Lines lines={copy.title} />}
      lead={<Lines lines={copy.lead} />}
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
