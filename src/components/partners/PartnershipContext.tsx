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
  initialFunnelState,
  type PartnershipFunnelAction,
  type PartnershipFunnelState,
  partnershipFunnelReducer,
} from "@/lib/partnerships";

const BookingDialog = dynamic(() => import("./BookingDialog"), { ssr: false });

const PartnershipContext = createContext<{
  selection: PartnershipFunnelState;
  dispatch: Dispatch<PartnershipFunnelAction>;
  openBooking: () => void;
} | null>(null);

export function PartnershipProvider({ children }: { children: ReactNode }) {
  const [selection, dispatch] = useReducer(
    partnershipFunnelReducer,
    initialFunnelState,
  );
  const [bookingOpen, setBookingOpen] = useState(false);
  const bookingTrigger = useRef<HTMLElement | null>(null);

  return (
    <PartnershipContext.Provider
      value={{
        selection,
        dispatch,
        openBooking: () => {
          bookingTrigger.current = document.activeElement as HTMLElement | null;
          setBookingOpen(true);
        },
      }}
    >
      {children}
      {bookingOpen ? (
        <BookingDialog
          selection={selection}
          onClose={() => setBookingOpen(false)}
          onRestoreFocus={() => bookingTrigger.current?.focus()}
        />
      ) : null}
    </PartnershipContext.Provider>
  );
}

export function usePartnership() {
  const context = useContext(PartnershipContext);
  if (!context)
    throw new Error("Partnership controls require PartnershipProvider");
  return context;
}
