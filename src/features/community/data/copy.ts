import type { ContentImage } from "@/lib/cms-content-model";

/**
 * The /community page's own copy as code writes it: the code fallback of the
 * `communityCopy` singleton (see `../content.ts`). Text may hold `{{name}}`
 * placeholders for site facts (`lib/content-tokens.ts`), filled when the
 * page renders. The journey and the departments are lists of their own
 * (`data/member-journey.ts`, `data/departments.ts`).
 */
export type CommunityCopy = {
  hero: {
    title: string;
    lead: string;
    photo: ContentImage;
    /** What, where and when the photo shows. */
    photoCaption: string;
  };
  journey: { title: string; lead: string };
  departments: { title: string; lead: string };
  closing: {
    title: string;
    /** The latest recruiting round, with its dates as placeholders. */
    lead: string;
    /** The label over the partners' pitch beside the closing. */
    companiesReader: string;
  };
};

export const communityCopyTemplate: CommunityCopy = {
  hero: {
    title: "The people who run TUM.ai.",
    lead: "{{org.activeMembers}}+ active members from {{org.majors}}+ majors and {{org.nationalities}}+ nationalities organize our research, events and startup program themselves. This page shows what membership looks like, from the first weekend to the alumni network.",
    photo: {
      src: "/assets/homepage/Onboarding25.webp",
      width: 1920,
      height: 1280,
      alt: "A new TUM.ai batch in matching black T-shirts gathered for a group photo at the kickoff",
    },
    // TODO(content): confirm this is the kickoff of a new batch; the date is
    // the one on the projector in the photo.
    photoCaption: "Kickoff, May 16, 2025",
  },
  journey: {
    title: "Semester by semester",
    lead: "Every member starts at the onboarding weekend. The rows below show when each step of the membership opens, counted in semesters.",
  },
  departments: {
    title: "The departments that run TUM.ai",
    lead: "On the initiative track, you join one of these teams. Together they organize everything TUM.ai does, from the Makeathon to the contracts.",
  },
  closing: {
    title: "Semester zero starts with your application.",
    lead: "The latest recruiting round: applications {{recruiting.application}}, interviews {{recruiting.interview}}, and the onboarding weekend {{recruiting.onboarding}}.",
    companiesReader: "For companies",
  },
};
