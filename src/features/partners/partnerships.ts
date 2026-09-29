import { contactEmails, partnershipContact } from "@/config/contact";
import {
  type PartnershipDuration,
  type PartnershipFinderCopy,
  type PartnershipIntent,
  partnershipFinderCopy,
} from "./data/partnership-finder";

/** The role address partnership requests go to (also the booking guest). */
export const PARTNER_EMAIL = contactEmails.partners;
/** The Cal.eu page "Book a call" embeds (see `partnershipContact`). */
export const PARTNER_BOOKING_URL = partnershipContact.bookingUrl;

export interface PartnershipSelection {
  intent: PartnershipIntent | null;
  duration: PartnershipDuration | null;
}

export interface PartnershipFunnelState extends PartnershipSelection {
  step: "intent" | "duration" | "result";
}

export type PartnershipFunnelAction =
  | { type: "intent"; intent: PartnershipIntent }
  | { type: "duration"; duration: PartnershipDuration }
  | { type: "back" }
  | { type: "reset" };

export const initialFunnelState: PartnershipFunnelState = {
  step: "intent",
  intent: null,
  duration: null,
};

export function partnershipFunnelReducer(
  state: PartnershipFunnelState,
  action: PartnershipFunnelAction,
): PartnershipFunnelState {
  switch (action.type) {
    case "intent":
      return { step: "duration", intent: action.intent, duration: null };
    case "duration":
      return state.intent
        ? { ...state, step: "result", duration: action.duration }
        : state;
    case "back":
      return state.step === "result"
        ? { ...state, step: "duration", duration: null }
        : initialFunnelState;
    case "reset":
      return initialFunnelState;
  }
}

/**
 * The format for the answers: research goals get the research format, any
 * other ongoing goal the long-term partnership, a one-off goal its own.
 */
export function getPartnershipRecommendation(
  { intent, duration }: PartnershipSelection,
  { recommendations }: PartnershipFinderCopy = partnershipFinderCopy,
) {
  if (!intent || !duration) return null;
  if (intent === "research") return recommendations.research;
  if (duration === "ongoing") return recommendations.longTerm;
  return recommendations[intent];
}

/** The answers as lines for the email body and the booking notes. */
export function getPartnershipContext(
  selection: PartnershipSelection,
  copy: PartnershipFinderCopy = partnershipFinderCopy,
) {
  const intent = copy.intents.find((item) => item.id === selection.intent);
  const duration = copy.durations.find(
    (item) => item.id === selection.duration,
  );
  const result = getPartnershipRecommendation(selection, copy);
  return [
    intent
      ? `Interest: ${intent.label}`
      : "I'm interested in partnering with TUM.ai.",
    duration ? `Relationship: ${duration.label}` : null,
    result
      ? `Recommended format: ${result.name}${selection.intent === "hackathon" && selection.duration === "ongoing" ? " (with first-choice hackathons)" : ""}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function getPartnershipEmailUrl(
  selection: PartnershipSelection = { intent: null, duration: null },
  copy: PartnershipFinderCopy = partnershipFinderCopy,
) {
  const intent = copy.intents.find((item) => item.id === selection.intent);
  const subject = intent
    ? `Partnership request: ${intent.shortLabel}`
    : "Partnership request: TUM.ai";
  return `mailto:${PARTNER_EMAIL}?cc=${encodeURIComponent(partnershipContact.cc.join(","))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi TUM.ai team,\n\n${getPartnershipContext(selection, copy)}\n\n`)}`;
}

export function getPartnershipBookingUrl(
  selection: PartnershipSelection,
  copy: PartnershipFinderCopy = partnershipFinderCopy,
) {
  const url = new URL(PARTNER_BOOKING_URL);
  url.searchParams.append("guest", PARTNER_EMAIL);
  url.searchParams.set("notes", getPartnershipContext(selection, copy));
  return url.toString();
}
