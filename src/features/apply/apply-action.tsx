import type { ReactNode } from "react";
import { Button, ButtonLink, StatusBadge } from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import { MembershipPhase } from "@/features/community";
import {
  type CallPhase,
  callInPhase,
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
 * What `render` shows for the call, kept current in the browser: the
 * variants for "not yet open", "open" and "closed" all ship with the page,
 * and the membership window island (<MembershipPhase>, as the header CTA
 * and the closing bands use) switches between them when the form opens and
 * at the deadline, so the /apply page (hourly ISR) never shows a phase that
 * has passed. `render` runs on the server, once per phase.
 */
export function LiveCallPhase({
  call,
  render,
}: {
  call: RecruitingCall;
  render: (call: RecruitingCall) => ReactNode;
}) {
  return (
    <MembershipPhase
      clock={call.clock}
      upcoming={render(callInPhase(call, "upcoming"))}
      open={render(callInPhase(call, "open"))}
      closed={render(callInPhase(call, "closed"))}
    />
  );
}

/**
 * The apply action for the render's call, kept current in the browser
 * (<LiveCallPhase>): the form link while the form is open, otherwise the
 * inert button with "Opens ..." before the form opens and "Applications
 * closed" after the deadline.
 */
export function LiveApplyAction({
  call,
  statusId,
}: {
  call: RecruitingCall;
  statusId: string;
}) {
  return (
    <LiveCallPhase
      call={call}
      render={(variant) => (
        <ApplyAction
          phase={variant.phase}
          href={variant.applicationUrl}
          statusId={statusId}
          closedLabel={variant.phase === "open" ? "" : closedLabelOf(variant)}
        />
      )}
    />
  );
}
