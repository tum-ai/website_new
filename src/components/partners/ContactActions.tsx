"use client";

import { CalendarDays, Mail } from "lucide-react";
import { Button, ButtonLink } from "@/components/ds";
import { getPartnershipEmailUrl } from "@/lib/partnerships";
import { cn } from "@/lib/utils";
import { usePartnership } from "./PartnershipContext";

/** Email (mailto with CCs and finder context) and booking-dialog actions. */
export function ContactActions({
  emailLabel = "Request via email",
  bookingFirst = false,
  size = "md",
  className,
}: {
  emailLabel?: string;
  bookingFirst?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const { selection, openBooking } = usePartnership();
  const email = (
    <ButtonLink
      key="email"
      href={getPartnershipEmailUrl(selection)}
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
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {bookingFirst ? [booking, email] : [email, booking]}
    </div>
  );
}

export function HeroContact({ className }: { className?: string }) {
  const { selection } = usePartnership();
  return (
    <ButtonLink
      href={getPartnershipEmailUrl(selection)}
      size="lg"
      arrow="external"
      className={className}
    >
      Get in touch
    </ButtonLink>
  );
}
