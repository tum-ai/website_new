import {
  type PartnershipDuration,
  type PartnershipIntent,
  partnershipDurations,
  partnershipIntents,
  recommendations,
} from "../data/partners";

export const PARTNER_EMAIL = "partners@tum-ai.com";
export const PARTNER_EMAIL_CC = [
  "silas.zamzow@tum-ai.com",
  "kim.schlemmer@tum-ai.com",
] as const;
export const PARTNER_BOOKING_URL =
  "https://cal.eu/silaszamzow/tumai-quick-chat";

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

export function getPartnershipRecommendation({
  intent,
  duration,
}: PartnershipSelection) {
  if (!intent || !duration) return null;
  if (intent === "research") return recommendations.research;
  if (duration === "ongoing") return recommendations.longTerm;
  return recommendations[intent];
}

export function getPartnershipContext(selection: PartnershipSelection) {
  const intent = partnershipIntents.find(
    (item) => item.id === selection.intent,
  );
  const duration = partnershipDurations.find(
    (item) => item.id === selection.duration,
  );
  const result = getPartnershipRecommendation(selection);
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
) {
  const intent = partnershipIntents.find(
    (item) => item.id === selection.intent,
  );
  const subject = intent
    ? `Partnership request — ${intent.shortLabel}`
    : "Partnership request — TUM.ai";
  return `mailto:${PARTNER_EMAIL}?cc=${encodeURIComponent(PARTNER_EMAIL_CC.join(","))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi TUM.ai team,\n\n${getPartnershipContext(selection)}\n\n`)}`;
}

export function getPartnershipBookingUrl(selection: PartnershipSelection) {
  const url = new URL(PARTNER_BOOKING_URL);
  url.searchParams.append("guest", PARTNER_EMAIL);
  url.searchParams.set("notes", getPartnershipContext(selection));
  return url.toString();
}
