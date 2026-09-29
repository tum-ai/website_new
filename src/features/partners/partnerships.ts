import { contactEmails, partnershipContact } from "@/config/contact";
import {
  type PartnershipDuration,
  type PartnershipFinderCopy,
  type PartnershipIntent,
  partnershipFinderCopy,
} from "./data/partnership-finder";

/**
 * Where partnership requests go: the partners' role address (also the
 * booking guest), the Cal.eu page "Book a call" embeds, and who it books.
 * Site facts: the page passes the render's (`getSiteFacts()`) to the
 * client islands through `PartnershipProvider`. The CC list stays in code
 * (`partnershipContact.cc`: it names people).
 */
export type PartnershipContact = {
  email: string;
  bookingUrl: string;
  bookingHost: string;
};

/** The code facts' {@link PartnershipContact}. */
export const codePartnershipContact: PartnershipContact = {
  email: contactEmails.partners,
  bookingUrl: partnershipContact.bookingUrl,
  bookingHost: partnershipContact.bookingHost,
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
  contact: PartnershipContact = codePartnershipContact,
) {
  const intent = copy.intents.find((item) => item.id === selection.intent);
  const subject = intent
    ? `Partnership request: ${intent.shortLabel}`
    : "Partnership request: TUM.ai";
  return `mailto:${contact.email}?cc=${encodeURIComponent(partnershipContact.cc.join(","))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi TUM.ai team,\n\n${getPartnershipContext(selection, copy)}\n\n`)}`;
}

export function getPartnershipBookingUrl(
  selection: PartnershipSelection,
  copy: PartnershipFinderCopy = partnershipFinderCopy,
  contact: PartnershipContact = codePartnershipContact,
) {
  const url = new URL(contact.bookingUrl);
  url.searchParams.append("guest", contact.email);
  url.searchParams.set("notes", getPartnershipContext(selection, copy));
  return url.toString();
}
