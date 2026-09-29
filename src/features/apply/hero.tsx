import { ButtonLink, PageHero } from "@/components/ds";
import type { MembershipConfig } from "@/config/membership";
import { fillPageTokens } from "@/lib/content-copy";
import { isCmsClockFixed } from "@/lib/mock-cms-env";
import { LiveApplyAction, LiveCallPhase } from "./apply-action";
import type { ApplyCopy } from "./data/apply";
import { LiveHeroDates } from "./live-call-dates";
import { callStatus, type RecruitingCall } from "./round";

/**
 * The call for members: the title and status on the left, and the page's
 * bold element on the right, the round's important dates with passed dates
 * struck through, over a ruler of the application window's days. The words
 * come from the page copy; the status and dates from the round, both kept
 * current in the browser (`membership` is the window `call` was computed
 * from).
 */
export function Hero({
  call,
  membership,
  copy,
}: {
  call: RecruitingCall;
  membership: MembershipConfig;
  copy: Pick<ApplyCopy, "heroTitle" | "heroLead" | "faqLabel" | "datesTitle">;
}) {
  return (
    <PageHero
      titleId="apply-hero-title"
      title={copy.heroTitle}
      emphasis="highlight"
      mark={false}
      lead={
        <>
          <LiveCallPhase
            call={call}
            render={(variant) => (
              <p className="text-fg">{callStatus(variant)}</p>
            )}
          />
          <p className="mt-4">{copy.heroLead}</p>
        </>
      }
      actions={
        <>
          <LiveApplyAction call={call} statusId="apply-hero-status" />
          <ButtonLink href="#apply-faq" size="lg" variant="outline">
            {copy.faqLabel}
          </ButtonLink>
        </>
      }
      classNames={{ grid: "lg:items-start" }}
      media={
        <div className="lg:pt-3">
          <p
            id="apply-dates-title"
            className="font-medium text-fg-muted text-small"
          >
            {fillPageTokens(copy.datesTitle, {
              round: call.name.toLowerCase(),
            })}
          </p>
          <LiveHeroDates
            call={call}
            config={membership}
            live={!isCmsClockFixed()}
            labelledBy="apply-dates-title"
          />
        </div>
      }
    />
  );
}
