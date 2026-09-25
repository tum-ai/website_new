/**
 * Single source for TUM.ai membership recruiting. The Apply page's actions,
 * status badge and FAQ read it, so a new recruiting round is one edit here.
 * See "Updating site facts" in docs/contributor-guide.md.
 */
export type MembershipConfig = {
  /** `false` shows a disabled apply button and an "Applications Closed" badge. */
  applicationsOpen: boolean;
  applicationUrl: string;
  /** Dates of the current (or last) recruiting round; shown in the Apply FAQ. */
  timeline: {
    application: string;
    interview: string;
    onboarding: string;
  };
};

export const membershipConfig: MembershipConfig = {
  applicationsOpen: false,
  applicationUrl: "https://tally.so/r/OD0Vgg",
  timeline: {
    application: "September 24th - October 27th",
    interview: "November 2nd - November 8th",
    onboarding: "November 14th - November 16th",
  },
};
