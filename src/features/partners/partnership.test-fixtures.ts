import type { PartnershipFinderCopy } from "./data/partnership-finder";
import type { PartnershipContact } from "./partnerships";
/** Synthetic input supplied explicitly to interactive tests. */
export const partnershipFinderCopy: PartnershipFinderCopy = {
  intents: ["talent", "hackathon", "brand", "research"].map((id) => ({
    id: id as "talent" | "hackathon" | "brand" | "research",
    label: `Sample ${id} goal`,
    shortLabel: `Sample ${id}`,
    detail: "Explore this goal.",
  })),
  durations: [
    {
      id: "one-off",
      label: "One sample project",
      detail: "A focused project.",
    },
    { id: "ongoing", label: "An ongoing sample", detail: "Continue together." },
  ],
  recommendations: {
    longTerm: {
      name: "Ongoing sample",
      description: "Continue the shared work.",
    },
    talent: {
      name: "Talent sample",
      description: "Meet sample collaborators.",
    },
    hackathon: {
      name: "Hackathon sample",
      description: "Explore a sample challenge.",
    },
    brand: { name: "Brand sample", description: "Share a sample idea." },
    research: {
      name: "Research sample",
      description: "Explore a sample question.",
    },
  },
  prompts: {
    intentQuestion: "Choose a sample goal.",
    durationQuestion: "Choose a sample timeframe.",
    resultQuestion: "Try {{format}} first.",
    firstChoice: "Start with a sample challenge.",
    bookingTitle: "Discuss a sample project",
    bookingLead: "Meet {{host}}.",
    bookingSlow: "Open the sample booking page.",
  },
};
export const partnershipIntents = partnershipFinderCopy.intents;
export const partnershipDurations = partnershipFinderCopy.durations;
export const recommendations = partnershipFinderCopy.recommendations;
export const testPartnershipContact: PartnershipContact = {
  email: "partners@example.com",
  bookingUrl: "https://cal.eu/example/sample",
  bookingHost: "Example Host",
};
