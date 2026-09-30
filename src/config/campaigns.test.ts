import { describe, expect, test } from "vitest";
import {
  type Campaign,
  campaignBoundaries,
  featuredEventIdAt,
  resolveActiveCampaigns,
  scheduleCampaign,
  scheduleCampaigns,
} from "./campaigns";

const iso = (instant: number | null) =>
  instant === null ? null : new Date(instant).toISOString();

const campaign = (overrides: Partial<Campaign> & { id: string }): Campaign => ({
  name: overrides.id,
  startDate: "01.10.2026",
  ...overrides,
});

describe("scheduleCampaign", () => {
  test("starts at Munich midnight and ends after the last day by default", () => {
    const scheduled = scheduleCampaign(
      campaign({ id: "a", startDate: "01.10.2026", endDate: "15.10.2026" }),
    );
    expect(iso(scheduled?.startsAt ?? null)).toBe("2026-09-30T22:00:00.000Z");
    expect(iso(scheduled?.endsAt ?? null)).toBe("2026-10-15T22:00:00.000Z");
  });

  test("uses the given times, the end exclusive", () => {
    const scheduled = scheduleCampaign(
      campaign({
        id: "a",
        startDate: "01.10.2026",
        startTime: "09:30",
        endDate: "01.10.2026",
        endTime: "18:00",
      }),
    );
    expect(iso(scheduled?.startsAt ?? null)).toBe("2026-10-01T07:30:00.000Z");
    expect(iso(scheduled?.endsAt ?? null)).toBe("2026-10-01T16:00:00.000Z");
  });

  test("resolves summer and winter time on the days the clocks change", () => {
    // 25 October 2026 has 25 hours in Munich: summer time ends at 03:00.
    const autumn = scheduleCampaign(
      campaign({ id: "a", startDate: "25.10.2026", endDate: "25.10.2026" }),
    );
    expect(iso(autumn?.startsAt ?? null)).toBe("2026-10-24T22:00:00.000Z");
    expect(iso(autumn?.endsAt ?? null)).toBe("2026-10-25T23:00:00.000Z");
    // 29 March 2026 has 23 hours: summer time starts at 02:00.
    const spring = scheduleCampaign(
      campaign({ id: "b", startDate: "29.03.2026", endDate: "29.03.2026" }),
    );
    expect(iso(spring?.startsAt ?? null)).toBe("2026-03-28T23:00:00.000Z");
    expect(iso(spring?.endsAt ?? null)).toBe("2026-03-29T22:00:00.000Z");
  });

  test("an open-ended campaign has no end", () => {
    expect(scheduleCampaign(campaign({ id: "a" }))?.endsAt).toBeNull();
  });

  test("never runs with a malformed date or time, or an end before the start", () => {
    expect(
      scheduleCampaign(campaign({ id: "a", startDate: "2026-10-01" })),
    ).toBeNull();
    expect(
      scheduleCampaign(campaign({ id: "a", startTime: "9:30" })),
    ).toBeNull();
    expect(
      scheduleCampaign(campaign({ id: "a", endDate: "30.09.2026" })),
    ).toBeNull();
    expect(
      scheduleCampaign(
        campaign({ id: "a", endDate: "01.10.2026", endTime: "00:00" }),
      ),
    ).toBeNull();
    expect(
      scheduleCampaigns([
        campaign({ id: "bad", startDate: "31.02.2026" }),
        campaign({ id: "good" }),
      ]).map(({ id }) => id),
    ).toStrictEqual(["good"]);
  });
});

describe("resolveActiveCampaigns", () => {
  const at = (value: string) => new Date(value);
  const dated = (
    id: string,
    startsAt: string | null,
    endsAt: string | null,
  ) => ({
    id,
    startsAt: startsAt === null ? null : Date.parse(startsAt),
    endsAt: endsAt === null ? null : Date.parse(endsAt),
  });
  const ids = (list: { id: string }[]) => list.map(({ id }) => id);

  test("runs from the start (inclusive) to the end (exclusive)", () => {
    const list = [dated("a", "2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z")];
    expect(
      ids(resolveActiveCampaigns(list, at("2026-09-30T23:59:59Z"))),
    ).toStrictEqual([]);
    expect(
      ids(resolveActiveCampaigns(list, at("2026-10-01T00:00:00Z"))),
    ).toStrictEqual(["a"]);
    expect(
      ids(resolveActiveCampaigns(list, at("2026-10-01T23:59:59Z"))),
    ).toStrictEqual(["a"]);
    expect(
      ids(resolveActiveCampaigns(list, at("2026-10-02T00:00:00Z"))),
    ).toStrictEqual([]);
  });

  test("overlapping campaigns: the latest start wins", () => {
    const list = [
      dated("long", "2026-09-01T00:00:00Z", "2026-12-01T00:00:00Z"),
      dated("burst", "2026-10-10T00:00:00Z", "2026-10-12T00:00:00Z"),
      dated("open-ended", "2026-09-15T00:00:00Z", null),
    ];
    expect(
      ids(resolveActiveCampaigns(list, at("2026-10-11T00:00:00Z"))),
    ).toStrictEqual(["burst", "open-ended", "long"]);
    // After the burst, the open-ended one (started later than "long") leads.
    expect(
      ids(resolveActiveCampaigns(list, at("2026-10-20T00:00:00Z"))),
    ).toStrictEqual(["open-ended", "long"]);
    // An open-ended campaign keeps running.
    expect(
      ids(resolveActiveCampaigns(list, at("2030-01-01T00:00:00Z"))),
    ).toStrictEqual(["open-ended"]);
  });

  test("equal starts keep their order; a missing start counts as earliest", () => {
    const list = [
      dated("always", null, null),
      dated("first", "2026-10-01T00:00:00Z", null),
      dated("second", "2026-10-01T00:00:00Z", null),
    ];
    expect(
      ids(resolveActiveCampaigns(list, at("2026-10-05T00:00:00Z"))),
    ).toStrictEqual(["first", "second", "always"]);
  });

  test("boundaries are every start and end that is set", () => {
    expect(
      campaignBoundaries([
        dated("a", "2026-10-01T00:00:00Z", null),
        dated("b", null, "2026-10-02T00:00:00Z"),
      ]).map((instant) => instant.toISOString()),
    ).toStrictEqual(["2026-10-01T00:00:00.000Z", "2026-10-02T00:00:00.000Z"]);
  });
});

test("the featured event is the latest running campaign's that names one", () => {
  const list = scheduleCampaigns([
    campaign({
      id: "event",
      startDate: "01.10.2026",
      featuredEventId: "event-1",
    }),
    campaign({
      id: "cta-only",
      startDate: "05.10.2026",
      headerCta: { variant: "partner", yieldsToRecruiting: true },
    }),
    campaign({
      id: "later-event",
      startDate: "10.10.2026",
      endDate: "11.10.2026",
      featuredEventId: "event-2",
    }),
  ]);
  expect(featuredEventIdAt(list, new Date("2026-10-06T12:00:00Z"))).toBe(
    "event-1",
  );
  expect(featuredEventIdAt(list, new Date("2026-10-10T12:00:00Z"))).toBe(
    "event-2",
  );
  expect(featuredEventIdAt(list, new Date("2026-09-01T12:00:00Z"))).toBeNull();
});
