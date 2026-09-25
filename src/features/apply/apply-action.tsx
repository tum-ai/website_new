import { Button, ButtonLink, StatusBadge } from "@/components/ds";
import { membershipConfig } from "@/config/membership";

/**
 * Primary apply action, driven by `membershipConfig` (the hero and the closing
 * CTA both render it). While applications are closed the button stays
 * focusable but inert (`aria-disabled`), and its description points at the
 * status badge so assistive tech announces why it is unavailable.
 */
export function ApplyAction({ statusId }: { statusId: string }) {
  if (membershipConfig.applicationsOpen) {
    return (
      <ButtonLink
        href={membershipConfig.applicationUrl}
        size="lg"
        arrow="external"
      >
        Apply now
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
        Apply now
      </Button>
      <span id={statusId} className="grid">
        <StatusBadge status="idle" size="lg">
          Applications Closed
        </StatusBadge>
      </span>
    </>
  );
}
