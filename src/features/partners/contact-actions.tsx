"use client";

import { Actions, Button, ButtonLink } from "@tum.ai/ui-kit";
import { CalendarDays, Mail } from "lucide-react";
import { usePartnership } from "./partnership-context";
import { getPartnershipEmailUrl } from "./partnerships";

/** Email (mailto with CCs and finder context) and booking-dialog actions. */
export function ContactActions({
  emailLabel = "Request via email",
  bookingFirst = false,
  size = "md",
  align,
  className,
}: {
  emailLabel?: string;
  bookingFirst?: boolean;
  size?: "md" | "lg";
  align?: "start" | "center";
  className?: string;
}) {
  const { selection, openBooking, copy, contact } = usePartnership();
  const email = (
    <ButtonLink
      key="email"
      href={getPartnershipEmailUrl(selection, copy, contact)}
      variant={bookingFirst ? "outline" : "primary"}
      size={size}
    >
      <Mail aria-hidden className="size-4" />
      {emailLabel}
    </ButtonLink>
  );
  const booking = (
    <Button
      key="booking"
      variant={bookingFirst ? "primary" : "outline"}
      size={size}
      onClick={openBooking}
    >
      <CalendarDays aria-hidden className="size-4" />
      Book a call
    </Button>
  );
  return (
    <Actions align={align} className={className}>
      {bookingFirst ? [booking, email] : [email, booking]}
    </Actions>
  );
}

/** The hero's email action; `label` comes from the page copy. */
export function HeroContact({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { selection, copy, contact } = usePartnership();
  return (
    <ButtonLink
      href={getPartnershipEmailUrl(selection, copy, contact)}
      size="lg"
      arrow="external"
      className={className}
    >
      {label}
    </ButtonLink>
  );
}
