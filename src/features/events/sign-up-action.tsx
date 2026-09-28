import { Button, ButtonLink } from "@/components/ds";
import { getSafeExternalUrl } from "@/lib/security";

/**
 * Sign-up call to action for an event with a `sign_up` value. Only http(s)
 * URLs pass `getSafeExternalUrl`; they open in a new tab (noopener, announced
 * by ButtonLink). Anything else shows the disabled "Applications Closed"
 * state.
 */
export function SignUpAction({
  title,
  signUp,
  size = "md",
}: {
  /** The event title, appended for screen readers ("Apply Now! for …"). */
  title: string;
  /** The event's `sign_up` value from the CMS. */
  signUp: string;
  /** Button size. */
  size?: "md" | "lg";
}) {
  const signUpUrl = getSafeExternalUrl(signUp);

  if (!signUpUrl) {
    return (
      <Button variant="secondary" size={size} disabled>
        Applications Closed
      </Button>
    );
  }

  return (
    <ButtonLink href={signUpUrl} external arrow="external" size={size}>
      Apply Now!
      <span className="sr-only"> for {title}</span>
    </ButtonLink>
  );
}
