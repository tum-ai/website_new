import "server-only";

import { defineQuery } from "next-sanity";
import { cache } from "react";
import { type BackfillDocument, backfillId } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { getCmsNow } from "@/lib/mock-cms-env";
import {
  isMunichTime,
  isoDayFromMunichDate,
  munichDateFromIsoDay,
} from "@/lib/munich-time";
import type {
  APPLICATION_WINDOW_QUERY_RESULT,
  CAMPAIGNS_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import {
  type Campaign,
  type CampaignHeaderCta,
  campaignsFallback,
  featuredEventIdAt,
  scheduleCampaigns,
} from "./campaigns";
import { type ELabApplicationWindow, eLabWindowFallback } from "./e-lab";
import { type MembershipConfig, membershipConfig } from "./membership";
import type { HeaderCtaVariant } from "./navigation";

/**
 * The dated-content slice: the application windows (membership and E-Lab)
 * and the campaigns in the CMS, or their code fallbacks
 * (`membershipConfig`, `eLabConfig`, no campaigns). Server only; islands get
 * the resolved windows as props (`ClockWindow`, `lib/clock-window.ts`).
 */

export const APPLICATION_WINDOW_QUERY =
  defineQuery(`*[_type == "applicationWindow" && program == $program] | order(_updatedAt desc)[0]{
  roundName,
  switchedOn,
  opens,
  deadlineDate,
  deadlineTime,
  applicationUrl,
  nextWindowLabel,
  milestones[]{ key, from, to }
}`);

export const CAMPAIGNS_QUERY =
  defineQuery(`*[_type == "campaign"] | order(startDate desc, _id asc){
  "id": _id,
  name,
  startDate,
  startTime,
  endDate,
  endTime,
  priority,
  headerCta{ variant, label, notifyUrl, yieldsToRecruiting },
  "featuredEventId": featuredEvent._ref
}`);

type Program = "membership" | "e-lab";

type WindowResult = NonNullable<APPLICATION_WINDOW_QUERY_RESULT>;

/** The pinned document of a program's window (the Studio pins the same ids). */
export const applicationWindowId = (program: Program) =>
  backfillId("applicationWindow", program);

/** A CMS `date` ("2026-10-27") as "27.10.2026", or `undefined` when unusable. */
const day = (value: string | null | undefined) =>
  (value && munichDateFromIsoDay(value)) || undefined;

const time = (value: string | null | undefined) =>
  value && isMunichTime(value) ? value : undefined;

const https = (value: string | null | undefined) =>
  value?.startsWith("https://") ? value : undefined;

/** A milestone as a day span, only with both days usable. */
function span(result: WindowResult, key: "interviews" | "onboarding") {
  const milestone = result.milestones?.find((item) => item.key === key);
  const from = day(milestone?.from);
  const to = day(milestone?.to);
  return from && to ? { from, to } : undefined;
}

function loadWindow<T>(
  program: Program,
  fallback: T,
  select: (result: WindowResult) => unknown,
): Promise<T> {
  return loadContent<T, APPLICATION_WINDOW_QUERY_RESULT>({
    fallback,
    query: APPLICATION_WINDOW_QUERY,
    params: { program },
    tags: ["content:applicationWindow"],
    label: `the ${program} application window`,
    mockDocuments: buildScheduleBackfill,
    select: (result) => (result ? select(result) : null),
  });
}

/**
 * The membership recruiting window for this render: the `membership`
 * application window over `membershipConfig`. Malformed dates and links are
 * left out, so the code value shows there instead of breaking the page.
 */
export const getMembershipWindow = cache(
  (): Promise<MembershipConfig> =>
    loadWindow("membership", membershipConfig, (result) => ({
      applicationsOpen: result.switchedOn,
      applicationUrl: https(result.applicationUrl),
      round: {
        name: result.roundName,
        opens: day(result.opens),
        deadlineDate: day(result.deadlineDate),
        deadlineTime: time(result.deadlineTime),
        interviews: span(result, "interviews"),
        onboarding: span(result, "onboarding"),
      },
    })),
);

/** The E-Lab application window for this render: the `e-lab` window over `eLabConfig`. */
export const getELabWindow = cache(
  (): Promise<ELabApplicationWindow> =>
    loadWindow("e-lab", eLabWindowFallback, (result) => ({
      applicationsOpen: result.switchedOn,
      applicationUrl: https(result.applicationUrl),
      applicationDeadlineDate: day(result.deadlineDate),
      applicationDeadlineTime: time(result.deadlineTime),
      nextApplicationWindow: result.nextWindowLabel,
    })),
);

const ctaVariants: readonly string[] = [
  "member",
  "partner",
  "elab",
  "notify",
] satisfies HeaderCtaVariant[];

type CampaignResult = CAMPAIGNS_QUERY_RESULT[number];

function headerCtaOf(
  cta: CampaignResult["headerCta"],
): CampaignHeaderCta | undefined {
  if (!cta?.variant || !ctaVariants.includes(cta.variant)) return undefined;
  const label = cta.label?.trim();
  const notifyUrl =
    cta.notifyUrl && /^(https:\/\/|mailto:)/.test(cta.notifyUrl)
      ? cta.notifyUrl
      : undefined;
  return {
    variant: cta.variant as HeaderCtaVariant,
    ...(label ? { label } : {}),
    ...(notifyUrl ? { notifyUrl } : {}),
    yieldsToRecruiting: cta.yieldsToRecruiting ?? true,
  };
}

/**
 * The campaigns as code shapes them. A campaign with a missing or malformed
 * date or time is dropped (and logged) rather than guessed at.
 */
export function campaignsFromQuery(result: CAMPAIGNS_QUERY_RESULT): Campaign[] {
  return result.flatMap((item) => {
    const startDate = day(item.startDate);
    const endDate = item.endDate ? day(item.endDate) : undefined;
    const startTime = item.startTime ? time(item.startTime) : undefined;
    const endTime = item.endTime ? time(item.endTime) : undefined;
    const malformed =
      !startDate ||
      (item.endDate && !endDate) ||
      (item.startTime && !startTime) ||
      (item.endTime && !endTime);
    if (malformed) {
      console.warn(
        `[cms-content] Skipping the campaign "${item.name}": a date or time is malformed.`,
      );
      return [];
    }
    const headerCta = headerCtaOf(item.headerCta);
    const featuredEventId = item.featuredEventId?.trim();
    const priority =
      typeof item.priority === "number" && Number.isInteger(item.priority)
        ? item.priority
        : undefined;
    const campaign: Campaign = {
      id: item.id,
      name: item.name ?? item.id,
      startDate,
      ...(startTime ? { startTime } : {}),
      ...(endDate ? { endDate } : {}),
      ...(endDate && endTime ? { endTime } : {}),
      ...(priority ? { priority } : {}),
      ...(headerCta ? { headerCta } : {}),
      ...(featuredEventId ? { featuredEventId } : {}),
    };
    return [campaign];
  });
}

/** Every campaign, from the CMS (code has none), as written; see `config/campaigns.ts`. */
export const getCampaigns = cache(
  (): Promise<readonly Campaign[]> =>
    loadContent<readonly Campaign[], CAMPAIGNS_QUERY_RESULT>({
      fallback: campaignsFallback,
      query: CAMPAIGNS_QUERY,
      tags: ["content:campaign"],
      label: "the campaigns",
      mockDocuments: buildScheduleBackfill,
      select: campaignsFromQuery,
    }),
);

/**
 * The `_id` of the `event` a running campaign features at `now`
 * (the render clock by default), or `null`. /events pins that event first
 * among its upcoming events and in its closing band (`pinFeaturedEvent`),
 * as long as it is upcoming.
 */
export async function getFeaturedEventId(
  now: Date = getCmsNow(),
): Promise<string | null> {
  return featuredEventIdAt(scheduleCampaigns(await getCampaigns()), now);
}

/** The two application windows recreating the code config, for `pnpm sanity:backfill`. */
export function buildScheduleBackfill(): BackfillDocument[] {
  const { round } = membershipConfig;
  const e = eLabWindowFallback;
  return [
    {
      _id: applicationWindowId("membership"),
      _type: "applicationWindow",
      program: "membership",
      roundName: round.name,
      switchedOn: membershipConfig.applicationsOpen,
      opens: isoDayFromMunichDate(round.opens),
      deadlineDate: isoDayFromMunichDate(round.deadlineDate),
      deadlineTime: round.deadlineTime,
      applicationUrl: membershipConfig.applicationUrl,
      milestones: (["interviews", "onboarding"] as const).map((key) => ({
        _key: key,
        _type: "milestone",
        key,
        from: isoDayFromMunichDate(round[key].from),
        to: isoDayFromMunichDate(round[key].to),
      })),
    },
    {
      _id: applicationWindowId("e-lab"),
      _type: "applicationWindow",
      program: "e-lab",
      switchedOn: e.applicationsOpen,
      deadlineDate: isoDayFromMunichDate(e.applicationDeadlineDate),
      deadlineTime: e.applicationDeadlineTime,
      applicationUrl: e.applicationUrl,
      nextWindowLabel: e.nextApplicationWindow,
    },
  ];
}
