import { ButtonLink } from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import { membershipWindowClock } from "@/config/membership";
import { getMembershipWindow } from "@/config/schedule-content";
import { MembershipPhase } from "./membership-phase";

/**
 * The member call to action in closing bands: the application form while
 * membership applications are open, otherwise the Apply page, which says
 * when the next call opens. Follows the dated window (<MembershipPhase>), so
 * it switches by itself when the form opens and at the deadline. The window
 * and the form come from the render's `getMembershipWindow()`.
 */
export async function MembershipApplyButton() {
  const membership = await getMembershipWindow();
  return (
    <MembershipPhase
      clock={membershipWindowClock(membership)}
      open={
        <ButtonLink href={membership.applicationUrl} size="lg" arrow="external">
          {callToActionLabels.apply}
        </ButtonLink>
      }
      closed={
        <ButtonLink href="/apply" size="lg" arrow>
          {callToActionLabels.member}
        </ButtonLink>
      }
    />
  );
}
