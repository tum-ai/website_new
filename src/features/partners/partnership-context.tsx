"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  type PartnershipFinderCopy,
  partnershipFinderCopy,
} from "./data/partnership-finder";
import {
  initialFunnelState,
  type PartnershipFunnelAction,
  type PartnershipFunnelState,
  partnershipFunnelReducer,
} from "./partnerships";

// Loaded on the first "Book a call"; the Cal.eu embed mounts only while open.
const BookingDialog = dynamic(
  () => import("./booking-dialog").then((m) => m.BookingDialog),
  { ssr: false },
);

const PartnershipContext = createContext<{
  selection: PartnershipFunnelState;
  dispatch: Dispatch<PartnershipFunnelAction>;
  openBooking: () => void;
  /** The finder's answers and formats, as the page serves them. */
  copy: PartnershipFinderCopy;
} | null>(null);

/**
 * Holds the partnership finder's answers and the booking dialog for the whole
 * page, so every contact action (hero, rows, finder, closing band) sends the
 * same context. The dialog's code loads on the first "Book a call", and
 * closing it returns focus to the control that opened it. `copy` is the
 * finder's wording from the page's content slice (code copy by default).
 */
export function PartnershipProvider({
  children,
  copy = partnershipFinderCopy,
}: {
  children: ReactNode;
  copy?: PartnershipFinderCopy;
}) {
  const [selection, dispatch] = useReducer(
    partnershipFunnelReducer,
    initialFunnelState,
  );
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRequested, setBookingRequested] = useState(false);
  const bookingTrigger = useRef<HTMLElement | null>(null);

  return (
    <PartnershipContext.Provider
      value={{
        selection,
        dispatch,
        openBooking: () => {
          bookingTrigger.current = document.activeElement as HTMLElement | null;
          setBookingRequested(true);
          setBookingOpen(true);
        },
        copy,
      }}
    >
      {children}
      {bookingRequested ? (
        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          selection={selection}
          copy={copy}
          finalFocus={bookingTrigger}
        />
      ) : null}
    </PartnershipContext.Provider>
  );
}

/** The finder state, its dispatch, `openBooking` and the finder copy; throws outside the provider. */
export function usePartnership() {
  const context = useContext(PartnershipContext);
  if (!context)
    throw new Error("Partnership controls require PartnershipProvider");
  return context;
}
