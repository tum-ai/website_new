import { ButtonLink, StatusBadge } from "@/components/ds";
import {
  eLabApplicationCopyOf,
  eLabPhaseCopyOf,
  eLabWindowClock,
} from "@/config/e-lab";
import { getELabWindow } from "@/config/schedule-content";
import { getSiteFacts } from "@/config/site-settings-content";
import { ELabPhase } from "./e-lab-phase";

type ELabApplicationCtaProps = {
  /** Button and badge height; keep equal to the neighbouring status badge. */
  size?: "md" | "lg";
};

/**
 * The application call to action for the current E-Lab cohort. It follows
 * the application phase (see <ELabPhase>), so it switches by itself at the
 * deadline:
 *
 * - open: the primary button, linking to the application form in a new tab.
 *   Its accessible name is the visible label plus the new-tab hint (WCAG
 *   2.5.3), so speech users can say what they see.
 * - closed: a muted "closed" status badge, so the page never shows a dead
 *   button.
 *
 * The window, form and copy come from the render's `getELabWindow()` and
 * `getSiteFacts()`.
 */
export async function ELabApplicationCta({
  size = "lg",
}: ELabApplicationCtaProps) {
  const [eLabWindow, facts] = await Promise.all([
    getELabWindow(),
    getSiteFacts(),
  ]);
  const { open, closed } = eLabPhaseCopyOf(
    facts.eLab.currentIteration,
    eLabWindow,
  );

  return (
    <ELabPhase
      clock={eLabWindowClock(eLabWindow)}
      open={
        <ButtonLink
          href={eLabWindow.applicationUrl}
          size={size}
          arrow="external"
        >
          {open.ctaLabel}
        </ButtonLink>
      }
      closed={
        <StatusBadge status="closed" size={size}>
          {closed.ctaLabel}
        </StatusBadge>
      }
    />
  );
}

/**
 * Live "applications open" badge with the deadline of the render's E-Lab
 * window. Renders nothing once applications close: the closed CTA already
 * reads as a status there.
 */
export async function ELabApplicationStatus({
  size = "lg",
}: {
  /** Keep equal to the neighbouring CTA's size so both share one height. */
  size?: "sm" | "md" | "lg";
}) {
  const [eLabWindow, facts] = await Promise.all([
    getELabWindow(),
    getSiteFacts(),
  ]);
  const { deadline } = eLabApplicationCopyOf(
    facts.eLab.currentIteration,
    eLabWindow,
  );
  return (
    <ELabPhase
      clock={eLabWindowClock(eLabWindow)}
      open={
        <StatusBadge status="live" size={size}>
          {/* Shorter label on phones keeps the pill on one line; below about
              360px it wraps (see StatusBadge). */}
          <span className="max-sm:hidden">Applications open</span>
          <span className="sm:hidden">Open</span> until{" "}
          <span className="tabular">{deadline}</span>
        </StatusBadge>
      }
      closed={null}
    />
  );
}
