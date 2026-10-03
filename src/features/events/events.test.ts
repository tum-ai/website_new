import { stegaEncode } from "@test/stega";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { Event } from "@/lib/types";
import {
  eventHosts,
  excerpt,
  formatEventDate,
  formatEventLocation,
  formatHosts,
  getEventPhotos,
  groupEventsBySemester,
  hasStartTime,
  hostsBeyondTitle,
  indexHosts,
  lockupParts,
  pinFeaturedEvent,
  REGISTER_SEMESTERS,
  recentSemesterEvents,
  semesterOf,
  splitEvents,
  summarizeEvents,
  toEventDetails,
} from "./events";

const at = (event_date: string, id = event_date) => ({ id, event_date });
const ids = (events: { id: string }[]) => events.map((event) => event.id);

/*
 * The server runs in UTC on Vercel and visitors sit in Munich. Every
 * expectation must hold whatever the process timezone is, so the whole
 * suite runs under several.
 */
describe.each([
  "UTC",
  "Europe/Berlin",
  "America/Los_Angeles",
  "Pacific/Kiritimati",
])("in process timezone %s", (timeZone) => {
  const original = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = timeZone;
  });
  afterAll(() => {
    process.env.TZ = original;
  });

  describe("splitEvents", () => {
    const now = new Date("2026-10-01T12:00:00Z");

    test("an event starting exactly now is upcoming; a millisecond earlier is past", () => {
      const { upcoming, past } = splitEvents(
        [
          at("2026-10-01T11:59:59.999Z", "just-past"),
          at("2026-10-01T12:00:00Z", "now"),
        ],
        now,
      );
      expect(ids(upcoming)).toEqual(["now"]);
      expect(ids(past)).toEqual(["just-past"]);
    });

    test("compares instants, not wall-clock dates: an offset is honoured", () => {
      // 13:30 in Munich summer time is 11:30 UTC, before `now`.
      const { upcoming, past } = splitEvents(
        [
          at("2026-10-01T13:30:00+02:00", "earlier"),
          at("2026-10-01T14:30:00+02:00", "later"),
        ],
        now,
      );
      expect(ids(past)).toEqual(["earlier"]);
      expect(ids(upcoming)).toEqual(["later"]);
    });

    test("an event without a start time stays upcoming for its whole Munich day", () => {
      // Stored at 00:00 UTC (02:00 in Munich summer time) on 1 October.
      const dateOnly = [at("2026-10-01T00:00:00Z", "oct-1")];
      expect(ids(splitEvents(dateOnly, now).upcoming)).toEqual(["oct-1"]);
      // 23:59:59.999 in Munich (UTC+2) is the last upcoming instant.
      const lastMoment = new Date("2026-10-01T21:59:59.999Z");
      expect(ids(splitEvents(dateOnly, lastMoment).upcoming)).toEqual([
        "oct-1",
      ]);
      const midnight = new Date("2026-10-01T22:00:00Z");
      expect(ids(splitEvents(dateOnly, midnight).past)).toEqual(["oct-1"]);
    });

    test("the end of a date-only event's day follows daylight saving time", () => {
      // 25 October 2026: summer time ends, so the Munich day ends at 23:00 UTC.
      const autumn = [at("2026-10-25T00:00:00Z", "oct-25")];
      expect(
        ids(splitEvents(autumn, new Date("2026-10-25T22:59:59.999Z")).upcoming),
      ).toEqual(["oct-25"]);
      expect(
        ids(splitEvents(autumn, new Date("2026-10-25T23:00:00Z")).past),
      ).toEqual(["oct-25"]);
      // 29 March 2026: summer time starts, so the day ends at 22:00 UTC.
      const spring = [at("2026-03-29T00:00:00Z", "mar-29")];
      expect(
        ids(splitEvents(spring, new Date("2026-03-29T21:59:59.999Z")).upcoming),
      ).toEqual(["mar-29"]);
      expect(
        ids(splitEvents(spring, new Date("2026-03-29T22:00:00Z")).past),
      ).toEqual(["mar-29"]);
    });

    test("an event with a start time turns past at its start, not at midnight", () => {
      const timed = [at("2026-10-01T09:00:00Z", "morning")];
      expect(ids(splitEvents(timed, now).past)).toEqual(["morning"]);
    });

    test("sorts upcoming soonest first and past newest first, leaving the input alone", () => {
      const events = [
        at("2026-09-02T10:00:00Z", "sep-2"),
        at("2026-12-01T10:00:00Z", "dec-1"),
        at("2026-06-15T10:00:00Z", "jun-15"),
        at("2026-10-05T10:00:00Z", "oct-5"),
      ];
      const input = [...events];
      const { upcoming, past } = splitEvents(events, now);
      expect(ids(upcoming)).toEqual(["oct-5", "dec-1"]);
      expect(ids(past)).toEqual(["sep-2", "jun-15"]);
      expect(events).toEqual(input);
    });
  });

  describe("semesterOf", () => {
    test("April to September is the summer semester", () => {
      expect(semesterOf("2026-04-01T10:00:00Z")).toEqual({
        key: "2026-summer",
        label: "Summer semester 2026",
      });
      expect(semesterOf("2026-09-30T10:00:00Z").key).toBe("2026-summer");
    });

    test("October to March is the winter semester, named after both years", () => {
      expect(semesterOf("2025-10-01T10:00:00Z")).toEqual({
        key: "2025-winter",
        label: "Winter semester 2025/26",
      });
      expect(semesterOf("2026-03-31T10:00:00Z").key).toBe("2025-winter");
      expect(semesterOf("2099-12-01T10:00:00Z").label).toBe(
        "Winter semester 2099/00",
      );
    });

    test("the boundary follows the Munich calendar day", () => {
      // 00:30 CEST on 1 April 2026 is still 31 March in UTC.
      expect(semesterOf("2026-03-31T22:30:00Z").key).toBe("2026-summer");
      // 01:30 CEST on 1 October is 30 September in UTC.
      expect(semesterOf("2026-09-30T23:30:00Z").key).toBe("2026-winter");
    });
  });

  describe("groupEventsBySemester", () => {
    test("keeps semesters in first-appearance order and events in input order", () => {
      const groups = groupEventsBySemester([
        at("2026-06-12T14:00:00Z", "jun"),
        at("2026-04-10T14:00:00Z", "apr"),
        at("2026-03-06T00:00:00Z", "mar"),
        at("2025-12-13T00:00:00Z", "dec"),
        at("2025-09-24T00:00:00Z", "sep"),
      ]);
      expect(groups.map((group) => [group.key, ids(group.events)])).toEqual([
        ["2026-summer", ["jun", "apr"]],
        ["2025-winter", ["mar", "dec"]],
        ["2025-summer", ["sep"]],
      ]);
    });

    test("is empty for no events", () => {
      expect(groupEventsBySemester([])).toEqual([]);
    });
  });

  describe("formatEventDate", () => {
    test("labels the Munich calendar day, not the UTC one", () => {
      expect(formatEventDate("2026-10-31T23:30:00Z")).toEqual({
        dateTime: "2026-10-31T23:30:00Z",
        long: "1 November 2026",
        short: "1 Nov",
        day: "1",
        month: "November",
        weekday: "Sunday",
        time: "00:30",
      });
    });

    test("an evening event in summer time keeps its day and local time", () => {
      const date = formatEventDate("2026-07-15T17:30:00Z");
      expect([date.long, date.time]).toEqual(["15 July 2026", "19:30"]);
    });

    test("an event stored at midnight UTC has a date but no start time", () => {
      const date = formatEventDate("2026-04-17T00:00:00.000Z");
      expect([date.long, date.time]).toEqual(["17 April 2026", undefined]);
    });
  });
});

describe("hasStartTime", () => {
  test("midnight UTC means the time isn't known", () => {
    expect(hasStartTime("2025-09-24T00:00:00.000Z")).toBe(false);
    expect(hasStartTime("2025-09-17T17:00:00.000Z")).toBe(true);
    expect(hasStartTime("2025-09-17T00:00:30.000Z")).toBe(true);
  });
});

describe("indexHosts", () => {
  const event = (event_date: string, hosts: string[], id = event_date) => ({
    id,
    event_date,
    hosts,
  });

  test("ranks by events, then by the latest one, then by name", () => {
    const index = indexHosts([
      event("2025-09-24T00:00:00Z", ["Anthropic", "Lovable", "CDTM"]),
      event("2025-12-13T00:00:00Z", ["Anthropic"]),
      event("2025-09-08T00:00:00Z", ["Google Cloud", "CDTM"]),
      event("2026-04-30T14:00:00Z", ["Yellow", "Project A"]),
    ]);
    expect(index.map((host) => [host.name, host.events.length])).toEqual([
      ["Anthropic", 2],
      ["CDTM", 2],
      ["Project A", 1],
      ["Yellow", 1],
      ["Lovable", 1],
      ["Google Cloud", 1],
    ]);
  });

  test("lists each host's events newest first", () => {
    const [anthropic] = indexHosts([
      event("2025-09-24T00:00:00Z", ["Anthropic"], "sep"),
      event("2025-12-13T00:00:00Z", ["Anthropic"], "dec"),
    ]);
    expect(ids(anthropic.events)).toEqual(["dec", "sep"]);
  });

  test("merges spellings that differ in case and spaces, keeping the latest", () => {
    const index = indexHosts([
      event("2025-01-01T10:00:00Z", ["hugging  face"]),
      event("2026-01-01T10:00:00Z", [" Hugging Face", "Hugging face"]),
    ]);
    expect(index).toHaveLength(1);
    expect(index[0].name).toBe("Hugging Face");
    expect(index[0].events).toHaveLength(2);
  });

  test("ignores blank names", () => {
    expect(indexHosts([event("2026-01-01T10:00:00Z", [" ", ""])])).toEqual([]);
  });

  test("merges a host that stega encodes per event in draft mode", () => {
    const index = indexHosts([
      event("2025-09-08T00:00:00Z", [stegaEncode("CDTM", "event-1", "hosts")]),
      event("2025-09-24T00:00:00Z", [stegaEncode("CDTM", "event-2", "hosts")]),
    ]);
    expect(index).toHaveLength(1);
    expect(index[0].events).toHaveLength(2);
  });
});

describe("co-host organisations", () => {
  const aws = { key: "aws", name: "AWS" };

  test("an event lists its referenced organisations, not its typed names", () => {
    expect(
      eventHosts({
        hosts: ["Amazon Web Services", "Old name"],
        coHosts: [aws],
      }),
    ).toEqual([aws]);
  });

  test("typed names stand in while no reference resolves", () => {
    expect(
      eventHosts({
        hosts: ["Amazon Web Services", " "],
        // A deleted organisation projects as null.
        coHosts: [null as never],
      }),
    ).toEqual([{ name: "Amazon Web Services" }]);
  });

  test("the hero counts a typed name and a reference to its organisation once", () => {
    const index = indexHosts([
      {
        id: "old",
        event_date: "2025-01-01T10:00:00Z",
        hosts: ["Amazon Web Services"],
      },
      {
        id: "new",
        event_date: "2026-01-01T10:00:00Z",
        hosts: ["Amazon Web Services"],
        coHosts: [aws],
      },
    ]);
    expect(
      index.map(({ key, name, events }) => [key, name, ids(events)]),
    ).toEqual([["aws", "AWS", ["new", "old"]]]);
  });

  test("the title leaves out the organisations it names", () => {
    expect(
      hostsBeyondTitle({
        title: "AWS x Lovable Hackathon",
        hosts: [],
        coHosts: [
          aws,
          { key: "lovable", name: "Lovable" },
          { key: "n8n", name: "n8n" },
        ],
      }),
    ).toEqual(["n8n"]);
  });

  test("an event with only referenced co-hosts counts as co-hosted", () => {
    expect(
      summarizeEvents([
        {
          event_date: "2026-04-17T00:00:00Z",
          category: "Hackathon",
          hosts: [],
          coHosts: [aws],
        },
      ]).withHosts,
    ).toBe(1);
  });
});

describe("summarizeEvents", () => {
  test("counts every event, the hackathons and the co-hosted ones", () => {
    expect(
      summarizeEvents([
        {
          event_date: "2026-04-17T00:00:00Z",
          category: "Hackathon",
          hosts: [],
        },
        {
          event_date: "2025-03-09T00:00:00Z",
          category: "Speaker",
          hosts: ["CDTM"],
        },
        {
          event_date: "2025-12-13T00:00:00Z",
          category: "Hackathon",
          hosts: ["Anthropic"],
        },
      ]),
    ).toEqual({ total: 3, since: "March 2025", hackathons: 2, withHosts: 2 });
  });

  test("counts stega-encoded hackathons in draft mode", () => {
    const hackathon = stegaEncode("Hackathon", "event-1", "category");
    expect(
      summarizeEvents([
        {
          event_date: "2026-04-17T00:00:00Z",
          category: hackathon as Event["category"],
          hosts: [],
        },
      ]).hackathons,
    ).toBe(1);
  });

  test("has no start month without events", () => {
    expect(summarizeEvents([]).since).toBeUndefined();
  });
});

describe("lockupParts", () => {
  test.each([
    [
      "Anthropic x Lovable x Hugging Face",
      ["Anthropic", "Lovable", "Hugging Face"],
    ],
    ["AI × Life Sciences", ["AI", "Life Sciences"]],
    [
      "TUM.ai X Anthropic Christmas Hackathon",
      ["TUM.ai", "Anthropic Christmas Hackathon"],
    ],
    ["Makeathon 2026", ["Makeathon 2026"]],
    ["n8n Xmas x-ray", ["n8n Xmas x-ray"]],
  ])("%s", (title, parts) => {
    expect(lockupParts(title)).toEqual(parts);
  });
});

describe("hostsBeyondTitle", () => {
  test("drops the hosts the title already names", () => {
    expect(
      hostsBeyondTitle({
        title: "Anthropic x Lovable x Hugging Face",
        hosts: ["Anthropic", "Lovable", "Hugging Face", "CDTM"],
      }),
    ).toEqual(["CDTM"]);
  });

  test("compares stega-encoded values in draft mode by their text", () => {
    const cdtm = stegaEncode("CDTM", "event-1", "hosts");
    expect(
      hostsBeyondTitle({
        title: stegaEncode("Anthropic x Lovable", "event-1", "title"),
        hosts: [stegaEncode("Anthropic", "event-1", "hosts"), cdtm],
      }),
    ).toEqual([cdtm]);
  });
});

describe("formatEventLocation", () => {
  test("joins location and city, without repeating the city", () => {
    expect(
      formatEventLocation({ location: "BMW Office", city: "Munich" }),
    ).toBe("BMW Office, Munich");
    expect(
      formatEventLocation({ location: "Mark, Munich", city: "Munich" }),
    ).toBe("Mark, Munich");
    expect(formatEventLocation({ city: "Online" })).toBe("Online");
    expect(formatEventLocation({})).toBe("");
  });
});

describe("excerpt", () => {
  test("keeps a short description whole, reading line breaks as spaces", () => {
    expect(excerpt("Line one.\n\nLine two.")).toBe("Line one. Line two.");
  });

  test("cuts a long description after the last sentence that fits", () => {
    const first = `${"a".repeat(150)}.`;
    const second = `${"b".repeat(150)}.`;
    expect(excerpt(`${first} ${second}`)).toBe(first);
  });

  test("cuts a single long sentence at a word, with an ellipsis", () => {
    const text = Array.from({ length: 60 }, () => "word").join(" ");
    const result = excerpt(text);
    expect(result.endsWith("word…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(221);
  });
});

describe("getEventPhotos", () => {
  const base = { title: "Makeathon" };

  test("prefers the photos, labelled in order", () => {
    expect(
      getEventPhotos({
        ...base,
        images: ["/a.webp", "/b.webp"],
        poster: "/p.webp",
      }),
    ).toEqual([
      { src: "/a.webp", alt: "Makeathon, image 1" },
      { src: "/b.webp", alt: "Makeathon, image 2" },
    ]);
  });

  test("falls back to the poster, then to nothing", () => {
    expect(getEventPhotos({ ...base, images: [], poster: "/p.webp" })).toEqual([
      { src: "/p.webp", alt: "Makeathon, poster" },
    ]);
    expect(getEventPhotos({ ...base, images: [] })).toEqual([]);
  });

  test("lists an asset used as both poster and photo once", () => {
    // The query returns [poster, img]; both may reference one asset.
    expect(
      getEventPhotos({
        ...base,
        images: ["/a.webp", "/a.webp"],
        poster: "/a.webp",
      }),
    ).toEqual([{ src: "/a.webp", alt: "Makeathon, image 1" }]);
  });
});

describe("formatHosts", () => {
  test("lists co-hosts in running text, without a serial comma", () => {
    expect(formatHosts(["Anthropic", "Lovable", "Hugging Face"])).toBe(
      "Anthropic, Lovable and Hugging Face",
    );
    expect(formatHosts(["CDTM"])).toBe("CDTM");
  });

  test("ignores stray spaces and empty entries from the editors", () => {
    expect(formatHosts([" Anthropic ", "", "Lovable"])).toBe(
      "Anthropic and Lovable",
    );
  });
});

describe("toEventDetails", () => {
  const event: Event = {
    id: "example-dialog-event",
    title: "  Anthropic x Lovable  ",
    event_date: "2026-10-10T16:30:00Z",
    location: "Munich Urban Colab",
    city: "Munich",
    hosts: ["Anthropic", "Lovable", "CDTM"],
    description: "An evening of demos.",
    category: "Hackathon",
    poster: "/poster.png",
    images: ["/one.png", "/two.png"],
  };

  test("shapes plain, pre-formatted props for the dialog", () => {
    expect(toEventDetails(event)).toEqual({
      title: "Anthropic x Lovable",
      date: formatEventDate("2026-10-10T16:30:00Z"),
      location: "Munich Urban Colab",
      category: "Hackathon",
      hosts: ["CDTM"],
      description: "An evening of demos.",
      image: { src: "/poster.png", alt: "Anthropic x Lovable, poster" },
    });
  });

  test("falls back to the first photo without a poster, and to none", () => {
    expect(toEventDetails({ ...event, poster: undefined }).image).toEqual({
      src: "/one.png",
      alt: "Anthropic x Lovable, image 1",
    });
    expect(
      toEventDetails({ ...event, poster: undefined, images: [] }).image,
    ).toBeUndefined();
  });
});

describe("pinFeaturedEvent", () => {
  const upcoming = [
    at("2026-10-02T18:00:00Z", "talk"),
    at("2026-10-09T18:00:00Z", "meetup"),
    at("2026-11-20T09:00:00Z", "makeathon"),
  ];

  test("a campaign's featured event leads; the rest stay soonest first", () => {
    expect(ids(pinFeaturedEvent(upcoming, "makeathon"))).toEqual([
      "makeathon",
      "talk",
      "meetup",
    ]);
  });

  test("without a featured event, or one that is not upcoming, the order stays", () => {
    expect(ids(pinFeaturedEvent(upcoming, null))).toEqual([
      "talk",
      "meetup",
      "makeathon",
    ]);
    // Started already (so among the past events), or deleted since.
    expect(ids(pinFeaturedEvent(upcoming, "last-year"))).toEqual([
      "talk",
      "meetup",
      "makeathon",
    ]);
    expect(pinFeaturedEvent([], "makeathon")).toEqual([]);
  });

  test("leaves its input untouched", () => {
    const before = ids(upcoming);
    pinFeaturedEvent(upcoming, "makeathon");
    expect(ids(upcoming)).toEqual(before);
  });
});

describe("recentSemesterEvents", () => {
  const at = (iso: string) => ({ event_date: iso });
  const past = [
    at("2026-06-12T16:00:00.000Z"),
    at("2026-04-17T00:00:00.000Z"),
    at("2026-03-06T00:00:00.000Z"),
    at("2025-09-24T00:00:00.000Z"),
    at("2024-11-23T00:00:00.000Z"),
    at("2021-04-18T00:00:00.000Z"),
  ];

  test("keeps the most recent semesters that have events, in order", () => {
    const recent = recentSemesterEvents(past, 2);
    expect(recent).toStrictEqual(past.slice(0, 3));
    expect(
      new Set(recent.map(({ event_date }) => semesterOf(event_date).key)),
    ).toStrictEqual(new Set(["2026-summer", "2025-winter"]));
  });

  test("by default the register's number of semesters", () => {
    const semesters = new Set(
      recentSemesterEvents(past).map(
        ({ event_date }) => semesterOf(event_date).key,
      ),
    );
    expect(semesters.size).toBe(REGISTER_SEMESTERS);
  });

  test("fewer semesters than the limit: every event", () => {
    expect(recentSemesterEvents(past.slice(0, 2))).toStrictEqual(
      past.slice(0, 2),
    );
  });
});
