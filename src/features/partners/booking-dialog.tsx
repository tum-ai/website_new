"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  TextLink,
} from "@tum.ai/ui-kit";
import { type RefObject, useEffect, useMemo, useState } from "react";
import { fillPageTokens } from "@/lib/content-copy";
import { type CalBooking, getCalBooking } from "@/lib/security";
import {
  type PartnershipFinderCopy,
  partnershipFinderCopy,
} from "./data/partnership-finder";
import {
  getPartnershipBookingUrl,
  getPartnershipContext,
  getPartnershipEmailUrl,
  type PartnershipContact,
  type PartnershipSelection,
} from "./partnerships";

const namespace = "tumai-partners";

/**
 * Booking dialog (Base UI). The popup content, and with it the Cal.eu embed,
 * mounts only while open; closing returns focus to `finalFocus`, the control
 * that opened it. On phones the popup fills the dialog viewport (dynamic
 * viewport height) and the calendar takes the remaining space, so the title,
 * close button and fallback links stay on screen and the embed is the only
 * scroller. The calendar embeds only a Cal booking page (`getCalBooking`),
 * because the embed script loads from the booking URL's origin; any other
 * URL leaves just the links.
 */
export function BookingDialog({
  open,
  onOpenChange,
  selection,
  copy = partnershipFinderCopy,
  contact,
  finalFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: PartnershipSelection;
  /** The finder's wording, for the booking notes and the email. */
  copy?: PartnershipFinderCopy;
  /** Where requests go (the site facts): the booking page, host and guest. */
  contact: PartnershipContact;
  finalFocus: RefObject<HTMLElement | null>;
}) {
  const cal = getCalBooking(contact.bookingUrl);
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent
        size="xl"
        finalFocus={finalFocus}
        className="max-w-275 max-sm:h-full"
      >
        <div className="flex h-full flex-col gap-5 p-5 sm:p-7">
          <div className="pr-12">
            <DialogTitle>{copy.prompts.bookingTitle}</DialogTitle>
            <DialogDescription className="mt-2">
              {fillPageTokens(copy.prompts.bookingLead, {
                host: contact.bookingHost,
              })}
            </DialogDescription>
          </div>
          {cal ? (
            <BookingCalendar
              cal={cal}
              selection={selection}
              copy={copy}
              contact={contact}
            />
          ) : null}
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-3 border-hairline border-t pt-4 text-small">
            <TextLink
              href={getPartnershipBookingUrl(selection, copy, contact)}
              arrow
            >
              Open booking page
            </TextLink>
            <TextLink href={getPartnershipEmailUrl(selection, copy, contact)}>
              Email us instead
            </TextLink>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingCalendar({
  cal: { calLink, calOrigin, embedJsUrl },
  selection,
  copy,
  contact,
}: {
  cal: CalBooking;
  selection: PartnershipSelection;
  copy: PartnershipFinderCopy;
  contact: PartnershipContact;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  const config = useMemo(
    () => ({
      notes: getPartnershipContext(selection, copy),
      guests: [contact.email],
      layout: "month_view" as const,
      theme: "light" as const,
    }),
    [selection, copy, contact.email],
  );

  useEffect(() => {
    let disposed = false;
    const timeout = window.setTimeout(() => {
      if (!disposed) setStatus("failed");
    }, 15000);
    const ready = () => {
      if (!disposed) {
        setStatus("ready");
        window.clearTimeout(timeout);
      }
    };
    const failed = () => {
      if (!disposed) {
        setStatus("failed");
        window.clearTimeout(timeout);
      }
    };
    const api = getCalApi({ namespace, embedJsUrl });
    void api
      .then((cal) => {
        if (disposed) return;
        cal("on", { action: "linkReady", callback: ready });
        cal("on", { action: "linkFailed", callback: failed });
      })
      .catch(failed);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      void api
        .then((cal) => {
          cal("off", { action: "linkReady", callback: ready });
          cal("off", { action: "linkFailed", callback: failed });
        })
        .catch(() => undefined);
    };
  }, [embedJsUrl]);

  return (
    <div className="min-h-0 flex-1 overflow-auto sm:h-[65dvh] sm:max-h-160 sm:min-h-105 sm:flex-none">
      <p
        role="status"
        className={
          status === "ready"
            ? "sr-only"
            : "flex items-center gap-2.5 p-4 text-fg-muted text-small"
        }
      >
        {status === "loading" ? (
          <span
            aria-hidden
            className="size-2 rounded-full bg-violet-500 motion-safe:animate-pulse-ring"
          />
        ) : null}
        {status === "loading"
          ? "Loading available times…"
          : status === "failed"
            ? copy.prompts.bookingSlow
            : "Calendar ready."}
      </p>
      <Cal
        namespace={namespace}
        calLink={calLink}
        calOrigin={calOrigin}
        embedJsUrl={embedJsUrl}
        config={config}
        style={{ width: "100%", height: "100%", overflow: "auto" }}
      />
    </div>
  );
}
