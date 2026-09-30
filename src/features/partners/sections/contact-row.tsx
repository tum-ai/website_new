import { Reveal } from "@/components/ds";
import { ContactActions } from "../contact-actions";

/** "Let’s talk." style closing row under a section's cards. */
export function ContactRow({
  title,
  bookingFirst,
}: {
  title: string;
  bookingFirst?: boolean;
}) {
  return (
    <Reveal className="mt-12 flex flex-col gap-6 border-hairline border-t pt-8 md:mt-16 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <h3 className="text-fg text-heading-lg">{title}</h3>
      <ContactActions bookingFirst={bookingFirst} />
    </Reveal>
  );
}
