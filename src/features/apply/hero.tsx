import { ButtonLink, DayRuler, KeyDates, PageHero } from "@/components/ds";
import { fillPageTokens } from "@/lib/content-copy";
import { LiveApplyAction, LiveCallPhase } from "./apply-action";
import type { ApplyCopy } from "./data/apply";
import { callStatus, type RecruitingCall } from "./round";

/**
 * The call for members: the title and status on the left, and the page's
 * bold element on the right, the round's important dates with passed dates
 * struck through, over a ruler of the application window's days. The words
 * come from the page copy; the status and dates from the round.
 */
export function Hero({
  call,
  copy,
}: {
  call: RecruitingCall;
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
          <KeyDates
            items={call.keyDates}
            aria-labelledby="apply-dates-title"
            drawIn
            className="mt-4"
          />
          <DayRuler
            className="mt-8"
            days={call.progress.totalDays}
            elapsed={call.progress.elapsedDays}
            startLabel={`${call.phase === "upcoming" ? "Opens" : "Opened"} ${call.short.opens}`}
            endLabel={`Deadline ${call.short.deadline}`}
            markLabel={call.phase === "open" ? "Today" : undefined}
            drawIn
          />
        </div>
      }
    />
  );
}
