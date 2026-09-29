import {
  isMunichTime,
  isoDayFromMunichDate,
  nextMunichDate,
  parseMunichDateTime,
} from "@/lib/munich-time";
import type { HeaderCtaVariant } from "./navigation";

/**
 * Campaigns: dated windows in which the site promotes something, such as a
 * different header call to action or a featured event. Editors schedule them
 * in the CMS (`campaign` documents, read by `getCampaigns()` in
 * `config/schedule-content.ts`); code has none, so without the CMS the header
 * follows `headerCtaSetting` alone. Everything here is pure and isomorphic:
 * the header resolves the schedule again in the browser, so a campaign
 * starts and ends on time even on a cached page.
 */

/** What a campaign does to the header's call to action. */
export type CampaignHeaderCta = {
  variant: HeaderCtaVariant;
  /** Replaces the variant's label while the campaign runs. */
  label?: string;
  /** The `notify` variant's target (a signup form); ignored for the others. */
  notifyUrl?: string;
  /**
   * `true`: shown only while membership applications are closed, so the
   * recruiting round keeps "Become a Member" (the campaign replaces the
   * fallback). `false`: shown for the whole campaign (it overrides).
   */
  yieldsToRecruiting: boolean;
};

/** One campaign as written: Munich wall-clock dates like the rest of the config. */
export type Campaign = {
  /** Stable key (the CMS document id). */
  id: string;
  /** What editors call it; not shown on the site. */
  name: string;
  /** First day, "DD.MM.YYYY", in Munich. */
  startDate: string;
  /** Start time on `startDate`, "HH:MM"; the start of the day when missing. */
  startTime?: string;
  /** Last day, "DD.MM.YYYY"; missing: the campaign runs until it is removed. */
  endDate?: string;
  /** End time on `endDate` (exclusive), "HH:MM"; the end of that day when missing. */
  endTime?: string;
  headerCta?: CampaignHeaderCta;
  /**
   * The `_id` of the `event` the campaign features: the CMS field is a weak
   * reference (so the campaign never blocks deleting the event), and the id
   * may name an event that no longer exists; readers only use it when it
   * matches an event they have.
   */
  featuredEventId?: string;
};

/** A campaign with its instants resolved (epoch milliseconds, serialisable). */
export type ScheduledCampaign = Omit<
  Campaign,
  "startDate" | "startTime" | "endDate" | "endTime"
> & {
  /** Runs from this instant on. */
  startsAt: number;
  /** Runs until just before this instant; `null`: open-ended. */
  endsAt: number | null;
};

/** The code campaigns: none. Campaigns come from the CMS only. */
export const campaignsFallback: readonly Campaign[] = [];

/**
 * The campaign's instants in Munich time: the start at `startTime` (or
 * midnight) on `startDate`; the end at `endTime` on `endDate`, or, without
 * a time, at midnight after `endDate`, so "until 15.10." includes all of the
 * 15th. `null` when a date or time is malformed or the end is not after the
 * start: such a campaign never runs (the Studio rejects it before publishing).
 */
export function scheduleCampaign(campaign: Campaign): ScheduledCampaign | null {
  const { startDate, startTime, endDate, endTime, ...rest } = campaign;
  try {
    if (startTime !== undefined && !isMunichTime(startTime)) return null;
    if (endTime !== undefined && !isMunichTime(endTime)) return null;
    // Throws on a day that is not on the calendar ("31.02.2026").
    isoDayFromMunichDate(startDate);
    if (endDate !== undefined) isoDayFromMunichDate(endDate);
    const startsAt = parseMunichDateTime(
      startDate,
      startTime ?? "00:00",
    ).getTime();
    const endsAt =
      endDate === undefined
        ? null
        : endTime === undefined
          ? parseMunichDateTime(nextMunichDate(endDate), "00:00").getTime()
          : parseMunichDateTime(endDate, endTime).getTime();
    if (endsAt !== null && endsAt <= startsAt) return null;
    return { ...rest, startsAt, endsAt };
  } catch {
    return null;
  }
}

/** {@link scheduleCampaign} for a list, dropping campaigns that can never run. */
export function scheduleCampaigns(
  campaigns: readonly Campaign[],
): ScheduledCampaign[] {
  return campaigns.flatMap((campaign) => {
    const scheduled = scheduleCampaign(campaign);
    return scheduled ? [scheduled] : [];
  });
}

/** The part of a scheduled campaign that decides when it runs. */
type Dated = { startsAt: number | null; endsAt: number | null };

/**
 * The campaigns running at `now` (from `startsAt` inclusive to `endsAt`
 * exclusive; a `null` start means "already running", a `null` end
 * "open-ended"), in precedence order: the latest start first, because the
 * most recently started campaign is the one an editor meant to show now.
 * Ties keep their input order (the query's order). Callers take the first
 * campaign that sets what they need (a header CTA, a featured event).
 */
export function resolveActiveCampaigns<T extends Dated>(
  campaigns: readonly T[],
  now: Date,
): T[] {
  const at = now.getTime();
  const start = ({ startsAt }: Dated) => startsAt ?? Number.NEGATIVE_INFINITY;
  return campaigns
    .filter(
      ({ startsAt, endsAt }) =>
        (startsAt === null || at >= startsAt) &&
        (endsAt === null || at < endsAt),
    )
    .sort((a, b) => (start(a) === start(b) ? 0 : start(a) < start(b) ? 1 : -1));
}

/** The instants at which {@link resolveActiveCampaigns} can change. */
export function campaignBoundaries(campaigns: readonly Dated[]): Date[] {
  return campaigns
    .flatMap(({ startsAt, endsAt }) => [startsAt, endsAt])
    .filter((at): at is number => at !== null)
    .map((at) => new Date(at));
}

/** The featured event at `now`: the first running campaign that names one. */
export function featuredEventIdAt(
  campaigns: readonly ScheduledCampaign[],
  now: Date,
): string | null {
  return (
    resolveActiveCampaigns(campaigns, now).find(
      (campaign) => campaign.featuredEventId,
    )?.featuredEventId ?? null
  );
}
