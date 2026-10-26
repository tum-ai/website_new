import { partnershipContactCc } from "@/config/contact";
import type {
  PartnershipDuration,
  PartnershipFinderCopy,
  PartnershipIntent,
} from "./data/partnership-finder";

/**
 * Where partnership requests go: the partners' role address (also the
 * booking guest), the Cal.eu page "Book a call" embeds, and who it books.
 * Site facts: the page passes the render's (`getSiteFacts()`) to the
 * client islands through `PartnershipProvider`. The CC list stays in code
 * (`partnershipContactCc`: it names people).
 */
export type PartnershipContact = {
  email: string;
  bookingUrl: string;
  bookingHost: string;
  /** The ELAB team's role address, the only recipient of founder and VC requests (no CCs). */
  ventureEmail?: string;
};

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
 * The format for the answers: research and venture goals get their own
 * format at any timeframe, any other ongoing goal the long-term partnership,
 * a one-off goal its own.
 */
export function getPartnershipRecommendation(
  { intent, duration }: PartnershipSelection,
  { recommendations }: PartnershipFinderCopy,
) {
  if (!intent || !duration) return null;
  if (intent === "research") return recommendations.research;
  if (intent === "venture") return recommendations.venture;
  if (duration === "ongoing") return recommendations.longTerm;
  return recommendations[intent];
}

/** The answers as lines for the email body and the booking notes. */
export function getPartnershipContext(
  selection: PartnershipSelection,
  copy: PartnershipFinderCopy,
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
  selection: PartnershipSelection,
  copy: PartnershipFinderCopy,
  contact: PartnershipContact,
) {
  const intent = copy.intents.find((item) => item.id === selection.intent);
  const subject = intent
    ? `Partnership request: ${intent.shortLabel}`
    : "Partnership request: TUM.ai";
  const message = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi TUM.ai team,\n\n${getPartnershipContext(selection, copy)}\n\n`)}`;
  if (selection.intent === "venture" && contact.ventureEmail) {
    return `mailto:${contact.ventureEmail}?${message}`;
  }
  return `mailto:${contact.email}?cc=${encodeURIComponent(partnershipContactCc.join(","))}&${message}`;
}

/** Whether "Book a call" is offered: the ELAB team takes founder and VC requests by email only. */
export function partnershipOffersBooking({ intent }: PartnershipSelection) {
  return intent !== "venture";
}

export function getPartnershipBookingUrl(
  selection: PartnershipSelection,
  copy: PartnershipFinderCopy,
  contact: PartnershipContact,
) {
  const url = new URL(contact.bookingUrl);
  url.searchParams.append("guest", contact.email);
  url.searchParams.set("notes", getPartnershipContext(selection, copy));
  return url.toString();
}
