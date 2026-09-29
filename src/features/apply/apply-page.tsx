import { FaqSection } from "@/components/ds";
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
 * from `membershipConfig` at `now`; the copy, milestones, journey and FAQ
 * come from the content slice (`content.ts`: the CMS or the code copy).
 */
export async function ApplyPage({ now }: ApplyPageProps) {
  const call = recruitingCall(now);
  const [faq, { copy, milestones, journey }] = await Promise.all([
    getApplyFaqs(),
    getApplyContent(),
  ]);
  return (
    <main>
      <Hero call={call} />
      <WhoShouldApply copy={copy.scope} />
      <Tracks copy={copy.tracks} journey={journey} />
      <Selection copy={copy.selection} call={call} />
      <SinceFounding copy={copy.history} milestones={milestones} />
      <FaqSection id="apply-faq" tone="mist" items={faq} />
      <ClosingSection call={call} />
    </main>
  );
}
