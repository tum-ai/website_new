import "server-only";
import { defineQuery } from "next-sanity";
import { cache } from "react";
import { loadContent } from "@/lib/cms-content";
import {
  contentBoolean,
  contentError,
  contentNumber,
  contentString,
  optionalString,
  requireArray,
  requireEnum,
  requireObject,
} from "@/lib/cms-content-model";
import { getCmsNow } from "@/lib/mock-cms-env";
import { isMunichTime, munichDateFromIsoDay } from "@/lib/munich-time";
import {
  type Campaign,
  type CampaignHeaderCta,
  featuredEventIdAt,
  scheduleCampaigns,
} from "./campaigns";
import type { ELabApplicationWindow } from "./e-lab";
import { type MembershipConfig, roundSchedule } from "./membership";
export const APPLICATION_WINDOW_QUERY =
  defineQuery(`*[_type == "applicationWindow" && program == $program && _id == $id] | order(_updatedAt desc)[0]{
  roundName,
  switchedOn,
  opens,
  deadlineDate,
  deadlineTime,
  applicationUrl,
  nextWindowLabel,
  milestones[]{ key, from, to }
}`);

const CAMPAIGNS_QUERY =
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
/** Pinned singleton identifier used by Studio and the reader. */
export const applicationWindowId = (program: Program) =>
  `applicationwindow-${program}`;
const label = "applicationWindow";
function day(value: unknown, path: string): string {
  const raw = contentString(value, label, path);
  const result = munichDateFromIsoDay(raw);
  if (!result) return contentError(label, path, "expected an ISO calendar day");
  return result;
}
function time(value: unknown, path: string): string {
  const raw = contentString(value, label, path);
  if (!isMunichTime(raw))
    return contentError(label, path, "expected HH:MM Munich time");
  return raw;
}
function https(value: unknown, path: string): string {
  const raw = contentString(value, label, path);
  try {
    if (new URL(raw).protocol === "https:") return raw;
  } catch {}
  return contentError(label, path, "expected HTTPS URL");
}
function span(
  result: Record<string, unknown>,
  key: "interviews" | "onboarding",
  deadline: string,
) {
  const items = requireArray(result.milestones, label, "milestones").map(
    (v, index) => requireObject(v, label, `milestones[${index}]`),
  );
  const matches = items.filter((item) => item.key === key);
  if (matches.length !== 1)
    return contentError(label, `milestones.${key}`, "required exactly once");
  const value = matches[0];
  const from = day(value.from, `milestones.${key}.from`);
  const to = day(value.to, `milestones.${key}.to`);
  if (String(value.to) < String(value.from) || String(value.from) < deadline)
    return contentError(
      label,
      `milestones.${key}`,
      "invalid milestone ordering",
    );
  return { from, to };
}
/** Complete membership window; malformed dates or missing milestones fail atomically. */
export function selectMembershipWindow(value: unknown): MembershipConfig {
  const result = requireObject(value, label, "membership");
  const config: MembershipConfig = {
    applicationsOpen: contentBoolean(result.switchedOn, label, "switchedOn"),
    applicationUrl: https(result.applicationUrl, "applicationUrl"),
    round: {
      name: contentString(result.roundName, label, "roundName"),
      opens: day(result.opens, "opens"),
      deadlineDate: day(result.deadlineDate, "deadlineDate"),
      deadlineTime: time(result.deadlineTime, "deadlineTime"),
      interviews: span(
        result,
        "interviews",
        contentString(result.deadlineDate, label, "deadlineDate"),
      ),
      onboarding: span(
        result,
        "onboarding",
        contentString(result.deadlineDate, label, "deadlineDate"),
      ),
    },
  };
  const schedule = roundSchedule(config.round);
  if (schedule.closesAt < schedule.opensAt)
    return contentError(label, "deadlineDate", "deadline precedes opening");
  return config;
}
/** Complete E-Lab application window. */
export function selectELabWindow(value: unknown): ELabApplicationWindow {
  const result = requireObject(value, label, "e-lab");
  return {
    applicationsOpen: contentBoolean(result.switchedOn, label, "switchedOn"),
    applicationUrl: https(result.applicationUrl, "applicationUrl"),
    applicationDeadlineDate: day(result.deadlineDate, "deadlineDate"),
    applicationDeadlineTime: time(result.deadlineTime, "deadlineTime"),
    nextApplicationWindow: contentString(
      result.nextWindowLabel,
      label,
      "nextWindowLabel",
    ),
  };
}
function loadWindow<T>(
  program: Program,
  select: (value: unknown) => T,
): Promise<T> {
  return loadContent({
    query: APPLICATION_WINDOW_QUERY,
    params: { program, id: applicationWindowId(program) },
    tags: ["content:applicationWindow"],
    label: `${program} application window`,
    select,
  });
}
export const getMembershipWindow = cache(() =>
  loadWindow("membership", selectMembershipWindow),
);
export const getELabWindow = cache(() => loadWindow("e-lab", selectELabWindow));
function headerCtaOf(
  value: unknown,
  path: string,
): CampaignHeaderCta | undefined {
  if (value == null) return undefined;
  const cta = requireObject(value, "campaign", path);
  const variant = requireEnum(
    cta.variant,
    ["member", "partner", "elab", "notify"] as const,
    "campaign",
    `${path}.variant`,
  );
  const label = optionalString(cta.label, "campaign", `${path}.label`);
  const notifyUrl = optionalString(
    cta.notifyUrl,
    "campaign",
    `${path}.notifyUrl`,
  );
  if (notifyUrl && !/^(https:\/\/|mailto:)/.test(notifyUrl))
    return contentError(
      "campaign",
      `${path}.notifyUrl`,
      "expected HTTPS or mailto URL",
    );
  if (variant === "notify" && !notifyUrl)
    return contentError(
      "campaign",
      `${path}.notifyUrl`,
      "notify requires a target",
    );
  return {
    variant,
    ...(label === undefined ? {} : { label }),
    ...(notifyUrl === undefined ? {} : { notifyUrl }),
    yieldsToRecruiting:
      cta.yieldsToRecruiting == null
        ? true
        : contentBoolean(
            cta.yieldsToRecruiting,
            "campaign",
            `${path}.yieldsToRecruiting`,
          ),
  };
}
/** Parse every published campaign; explicit empty lists are valid, invalid entries fail. */
export function campaignsFromQuery(value: unknown): Campaign[] {
  const campaigns = requireArray(value, "campaign", "").map(
    (v, index): Campaign => {
      const path = `[${index}]`;
      const item = requireObject(v, "campaign", path);
      const id = contentString(item.id, "campaign", `${path}.id`);
      const name = contentString(item.name, "campaign", `${path}.name`);
      const startDate = day(item.startDate, `${path}.startDate`);
      const startTime =
        item.startTime == null
          ? undefined
          : time(item.startTime, `${path}.startTime`);
      const endDate =
        item.endDate == null ? undefined : day(item.endDate, `${path}.endDate`);
      const endTime =
        item.endTime == null
          ? undefined
          : time(item.endTime, `${path}.endTime`);
      if (endTime && !endDate)
        return contentError(
          "campaign",
          `${path}.endTime`,
          "requires an end date",
        );
      const priority =
        item.priority == null
          ? undefined
          : contentNumber(item.priority, "campaign", `${path}.priority`);
      if (
        priority !== undefined &&
        (!Number.isInteger(priority) || priority < -10 || priority > 10)
      )
        return contentError(
          "campaign",
          `${path}.priority`,
          "expected integer in -10..10",
        );
      const headerCta = headerCtaOf(item.headerCta, `${path}.headerCta`);
      const featuredEventId = optionalString(
        item.featuredEventId,
        "campaign",
        `${path}.featuredEventId`,
      );
      return {
        id,
        name,
        startDate,
        ...(startTime === undefined ? {} : { startTime }),
        ...(endDate === undefined ? {} : { endDate }),
        ...(endTime === undefined ? {} : { endTime }),
        ...(priority === undefined ? {} : { priority }),
        ...(headerCta === undefined ? {} : { headerCta }),
        ...(featuredEventId === undefined ? {} : { featuredEventId }),
      };
    },
  );
  if (scheduleCampaigns(campaigns).length !== campaigns.length)
    return contentError(
      "campaign",
      "dates",
      "every campaign must end after it starts",
    );
  return campaigns;
}
export const getCampaigns = cache(() =>
  loadContent({
    query: CAMPAIGNS_QUERY,
    tags: ["content:campaign"],
    label: "campaigns",
    select: campaignsFromQuery,
  }),
);
/** Currently promoted published event; dangling weak references cannot match a rendered event. */
export async function getFeaturedEventId(
  now: Date = getCmsNow(),
): Promise<string | null> {
  return featuredEventIdAt(scheduleCampaigns(await getCampaigns()), now);
}
