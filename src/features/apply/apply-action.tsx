import { Button, ButtonLink, StatusBadge } from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import { MembershipPhase } from "@/features/community";
import {
  type CallPhase,
  closedLabel as closedLabelOf,
  type RecruitingCall,
} from "./round";

type ApplyActionProps = {
  /** The call's phase at render time (`recruitingCall(now).phase`). */
  phase: CallPhase;
  /** The application form (`recruitingCall(now).applicationUrl`). */
  href: string;
  /** id of the status line, unique per instance on the page. */
  statusId: string;
  /** Status line while the call isn't open, e.g. "Opens 28 September". */
  closedLabel: string;
};

/**
 * The primary apply action: the application form while the call is open.
 * Otherwise the button stays focusable but inert (`aria-disabled`), and its
 * description points at the status badge so assistive tech announces why.
 */
export function ApplyAction({
  phase,
  href,
  statusId,
  closedLabel,
}: ApplyActionProps) {
  if (phase === "open") {
    return (
      <ButtonLink href={href} size="lg" arrow="external">
        {callToActionLabels.apply}
      </ButtonLink>
    );
  }

  return (
    <>
      <Button
        size="lg"
        disabled
        focusableWhenDisabled
        aria-describedby={statusId}
      >
        {callToActionLabels.apply}
      </Button>
      <span id={statusId} className="grid">
        <StatusBadge
          status={phase === "upcoming" ? "idle" : "closed"}
          size="lg"
        >
          {closedLabel}
        </StatusBadge>
      </span>
    </>
  );
}

/**
 * The apply action for the render's call, kept current in the browser: it
 * becomes the form link when the form opens and the inert button at the
 * deadline, through the same membership window island as the header CTA
 * and the closing bands (<MembershipPhase>), so the /apply page (hourly
 * ISR) never offers a closed form or hides an open one in between.
 */
export function LiveApplyAction({
  call,
  statusId,
}: {
  call: RecruitingCall;
  statusId: string;
}) {
  // While open, the closed variant is what the deadline turns it into.
  const closedPhase = call.phase === "open" ? "closed" : call.phase;
  return (
    <MembershipPhase
      clock={call.clock}
      open={
        <ApplyAction
          phase="open"
          href={call.applicationUrl}
          statusId={statusId}
          closedLabel=""
        />
      }
      closed={
        <ApplyAction
          phase={closedPhase}
          href={call.applicationUrl}
          statusId={statusId}
          closedLabel={closedLabelOf({ ...call, phase: closedPhase })}
        />
      }
    />
  );
}
