import { FaqSection } from "@tum.ai/ui-kit";
import { getMembershipWindow } from "@/config/schedule-content";
import { getSiteFacts } from "@/config/site-settings-content";
import { getMemberStories } from "@/features/community/server";
import { getPartnersCopy } from "@/features/partners/server";
import { ClosingSection } from "./closing-section";
import { getApplyContent, getApplyFaqs } from "./content";
import { Hero } from "./hero";
import { recruitingCall } from "./round";
import { Selection } from "./selection";
import { SinceFounding } from "./since-founding";
import { Tracks } from "./tracks";
import { WhoShouldApply } from "./who-should-apply";

type ApplyPageProps = {
  /** The server's "now" (fixed under the mock CMS): the round's state follows it. */
  now: Date;
};

/**
 * Recruitment page (/apply; join.tum-ai.com redirects here), set as a
 * conference's call for papers: the call and its important dates (ink), who
 * should apply (paper), what you'll work on (mist), how selection works
 * (paper), what members started since the founding (lavender), the FAQ
 * (mist), and the submission box (ink). Every date and the open state come
 * from the render's membership window (`getMembershipWindow()`) at `now`;
 * the copy, milestones, journey and FAQ from the content slice
 * (`content.ts`), the mission from the site facts, and the member stories
 * and partner pitch from their slices: each the CMS or the code.
 */
export async function ApplyPage({ now }: ApplyPageProps) {
  const [
    membership,
    faq,
    { copy, milestones, journey },
    facts,
    stories,
    { pitch },
  ] = await Promise.all([
    getMembershipWindow(),
    getApplyFaqs(),
    getApplyContent(),
    getSiteFacts(),
    getMemberStories(),
    getPartnersCopy(),
  ]);
  const call = recruitingCall(now, membership);
  return (
    <main>
      <Hero call={call} membership={membership} copy={copy} />
      <WhoShouldApply copy={copy.scope} mission={facts.brandMission} />
      <Tracks copy={copy.tracks} journey={journey} stories={stories} />
      <Selection copy={copy.selection} call={call} />
      <SinceFounding copy={copy.history} milestones={milestones} />
      <FaqSection id="apply-faq" tone="mist" items={faq} />
      <ClosingSection
        call={call}
        membership={membership}
        copy={copy.closing}
        partnerPitch={pitch}
      />
    </main>
  );
}
