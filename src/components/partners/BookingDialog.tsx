"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPartnershipBookingUrl,
  getPartnershipContext,
  getPartnershipEmailUrl,
  PARTNER_BOOKING_URL,
  type PartnershipSelection,
} from "@/lib/partnerships";

const namespace = "tumai-partners";
const bookingUrl = new URL(PARTNER_BOOKING_URL);
const embedJsUrl = `${bookingUrl.origin}/embed.js`;

export default function BookingDialog({
  selection,
  onClose,
  onRestoreFocus,
}: {
  selection: PartnershipSelection;
  onClose: () => void;
  onRestoreFocus: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  const config = useMemo(
    () => ({
      notes: getPartnershipContext(selection),
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="partner-booking-dialog"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
      >
        <div className="partner-booking-heading">
          <DialogTitle>Let’s talk about your partnership.</DialogTitle>
          <DialogDescription>
            Pick a time for a quick chat with Silas from TUM.ai.
          </DialogDescription>
        </div>
        <div className="partner-booking-calendar">
          <p
            role="status"
            className={
              status === "ready" ? "sr-only" : "partner-booking-status"
            }
          >
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
        <div className="partner-booking-fallback">
          <a
            href={getPartnershipBookingUrl(selection)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open booking page <ExternalLink size={14} />
          </a>
          <a href={getPartnershipEmailUrl(selection)}>Email us instead</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
