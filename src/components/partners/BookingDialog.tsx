"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { type RefObject, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  TextLink,
} from "@/components/ds";
import {
  getPartnershipBookingUrl,
  getPartnershipContext,
  getPartnershipEmailUrl,
  PARTNER_BOOKING_URL,
  PARTNER_EMAIL,
  type PartnershipSelection,
} from "@/lib/partnerships";

const namespace = "tumai-partners";
const bookingUrl = new URL(PARTNER_BOOKING_URL);
const embedJsUrl = `${bookingUrl.origin}/embed.js`;

/**
 * Booking dialog (Base UI). The popup content, and with it the Cal.eu embed,
 * mounts only while open; closing returns focus to `finalFocus`, the control
 * that opened it.
 */
export default function BookingDialog({
  open,
  onOpenChange,
  selection,
  finalFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: PartnershipSelection;
  finalFocus: RefObject<HTMLElement | null>;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent
        size="xl"
        finalFocus={finalFocus}
        className="flex max-w-[68.75rem] flex-col gap-5 p-5 sm:p-7"
      >
        <div className="pr-12">
          <DialogTitle>Let’s talk about your partnership.</DialogTitle>
          <DialogDescription className="mt-2">
            Pick a time for a quick chat with Silas from TUM.ai.
          </DialogDescription>
        </div>
        <BookingCalendar selection={selection} />
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-3 border-t border-hairline pt-4 text-small">
          <TextLink href={getPartnershipBookingUrl(selection)} arrow>
            Open booking page
          </TextLink>
          <TextLink href={getPartnershipEmailUrl(selection)}>
            Email us instead
          </TextLink>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingCalendar({ selection }: { selection: PartnershipSelection }) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  const config = useMemo(
    () => ({
      notes: getPartnershipContext(selection),
      guests: [PARTNER_EMAIL],
      layout: "month_view" as const,
      theme: "light" as const,
    }),
    [selection],
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
  }, []);

  return (
    <div className="h-[min(630px,65dvh)] min-h-[360px] overflow-auto sm:min-h-[420px]">
      <p
        role="status"
        className={
          status === "ready"
            ? "sr-only"
            : "flex items-center gap-2.5 p-4 text-small text-fg-muted"
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
            ? "Calendar taking a while? Open the booking page below, or email us."
            : "Calendar ready."}
      </p>
      <Cal
        namespace={namespace}
        calLink={bookingUrl.pathname.slice(1)}
        calOrigin={bookingUrl.origin}
        embedJsUrl={embedJsUrl}
        config={config}
        style={{ width: "100%", height: "100%", overflow: "auto" }}
      />
    </div>
  );
}
