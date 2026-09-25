import { Button, ButtonLink, StatusBadge } from "@/components/ds";

/** Application form (Tally). */
const APPLICATION_URL = "https://tally.so/r/OD0Vgg";

/**
 * Single switch for the recruiting phase. `false` renders a disabled action
 * plus an "Applications Closed" status; `true` renders a real link to the
 * form. Both the hero and the closing CTA read it, so reopening applications
 * is a one-line change.
 */
const applicationsOpen: boolean = false;

/**
 * Primary apply action. While applications are closed the button stays
 * focusable but inert (`aria-disabled`), and its description points at the
 * status badge so assistive tech announces why it is unavailable.
 */
export default function ApplyAction({ statusId }: { statusId: string }) {
  if (applicationsOpen) {
    return (
      <ButtonLink href={APPLICATION_URL} size="lg" arrow="external">
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
      <span id={statusId}>
        <StatusBadge status="idle" size="lg">
          Applications Closed
        </StatusBadge>
      </span>
    </>
  );
}
