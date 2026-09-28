import { ArrowUpRight } from "lucide-react";
import { CtaBand } from "@/components/ds";
import { ContactActions } from "../contact-actions";

/**
 * Closing call to action. `#partner-contact` is the header CTA's target on
 * this page, so it lands below the fixed header.
 */
export function ContactSection() {
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
      title={
        <>
          Let&apos;s build
          <br />
          something big!
        </>
      }
      lead={
        <>
          The next chapter of AI starts with the right people.
          <br />
          Let’s bring yours and ours together.
        </>
      }
    >
      <ContactActions
        bookingFirst
        emailLabel="Email us"
        size="lg"
        align="center"
      />
    </CtaBand>
  );
}
