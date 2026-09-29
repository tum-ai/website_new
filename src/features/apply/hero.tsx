import { ButtonLink, DayRuler, KeyDates, PageHero } from "@/components/ds";
import { ApplyAction } from "./apply-action";
import { heroLead } from "./data/apply";
import { callStatus, closedLabel, type RecruitingCall } from "./round";

/**
 * The call for members: the title and status on the left, and the page's
 * bold element on the right, the round's important dates with passed dates
 * struck through, over a ruler of the application window's days.
 */
export function Hero({ call }: { call: RecruitingCall }) {
  return (
    <PageHero
      titleId="apply-hero-title"
      title="Call for members."
      emphasis="highlight"
      mark={false}
      lead={
        <>
          <p className="text-fg">{callStatus(call)}</p>
          <p className="mt-4">{heroLead}</p>
        </>
      }
      actions={
        <>
          <ApplyAction
            phase={call.phase}
            href={call.applicationUrl}
            statusId="apply-hero-status"
            closedLabel={closedLabel(call)}
          />
          <ButtonLink href="#apply-faq" size="lg" variant="outline">
            Read the FAQ
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
            Important dates, {call.name.toLowerCase()}
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
