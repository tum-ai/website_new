import { ButtonLink } from "@/components/ds";
import { membershipConfig } from "@/config/membership";
import { MembershipPhase } from "./membership-phase";

/**
 * The member call to action in closing bands: the application form while
 * membership applications are open, otherwise the Apply page, which says
 * when the next call opens. Follows the dated window (<MembershipPhase>), so
 * it switches by itself when the form opens and at the deadline.
 */
export function MembershipApplyButton() {
  return (
    <MembershipPhase
      open={
        <ButtonLink
          href={membershipConfig.applicationUrl}
          size="lg"
          arrow="external"
        >
          Apply now
        </ButtonLink>
      }
      closed={
        <ButtonLink href="/apply" size="lg" arrow>
          Become a Member
        </ButtonLink>
      }
    />
  );
}
