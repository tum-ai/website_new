"use client";

import { ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPartnershipEmailUrl } from "@/lib/partnerships";
import { usePartnership } from "./PartnershipContext";

export function ContactActions({
  emailLabel = "Request via email",
  bookingFirst = false,
}: {
  emailLabel?: string;
  bookingFirst?: boolean;
}) {
  const { selection, openBooking } = usePartnership();
  const email = (
    <Button
      key="email"
      asChild
      variant={bookingFirst ? "outline" : "primary"}
      data-tone={bookingFirst ? "outline" : "primary"}
      className="partner-button"
    >
      <a href={getPartnershipEmailUrl(selection)}>
        <Mail size={18} />
        {emailLabel}
      </a>
    </Button>
  );
  const booking = (
    <Button
      key="booking"
      variant={bookingFirst ? "primary" : "outline"}
      data-tone={bookingFirst ? "primary" : "outline"}
      className="partner-button"
      onClick={openBooking}
    >
      <CalendarDays size={18} />
      Book a call
    </Button>
  );
  return (
    <div className="partner-contact-actions">
      {bookingFirst ? [booking, email] : [email, booking]}
    </div>
  );
}

export function HeroContact() {
  const { selection } = usePartnership();
  return (
    <Button asChild variant="primary" className="partner-button">
      <a href={getPartnershipEmailUrl(selection)}>
        Get in touch
        <ArrowUpRight size={18} />
      </a>
    </Button>
  );
}
