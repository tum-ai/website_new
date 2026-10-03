import { evaluateMockQuery, getMockContentDocuments } from "./cms-content-mock";
import type { CmsFixtureDocument } from "./cms-fixtures/types";
import { omitNulls } from "./omit-nulls";
import { EVENTS_QUERY, RESEARCH_QUERY } from "./sanity-queries";
import type { Event, ResearchProject } from "./types";

const day = 24 * 60 * 60 * 1000;
const dateAt = (now: Date, offset: number) => {
  const date = new Date(now.getTime() + offset * day);
  date.setUTCHours(18, 0, 0, 0);
  return date.toISOString();
};
const image = {
  _type: "image",
  asset: { _type: "reference", _ref: "fixture-photo" },
};

/** Small synthetic cases cover filters, dates, missing images and long descriptions. */
export function getMockEventDocuments(now: Date): CmsFixtureDocument[] {
  return [
    "Hackathon",
    "Speaker",
    "Event",
    "E-Lab",
    "Hackathon",
    "Speaker",
    "Event",
    "E-Lab",
  ].map((category, index) => ({
    _id: `fixture-event-${index}`,
    _type: "event",
    title: `Example ${category.toLowerCase()} ${index + 1}`,
    desc:
      index === 0
        ? "This is an example event for local development. ".repeat(9)
        : "Build, discuss and share ideas with a small example team.",
    event_date: dateAt(now, index < 4 ? 9 + index : -10 - index),
    end_date:
      category === "Hackathon"
        ? dateAt(now, index < 4 ? 10 + index : -9 - index)
        : undefined,
    location: index === 3 ? "Online" : "Example campus",
    city: index === 3 ? "Online" : "Munich",
    category,
    hosts: index === 0 ? ["Example team", "Example community"] : [],
    coHosts:
      index === 0
        ? [
            {
              _type: "reference",
              _key: "example",
              _ref: "organization-example-company",
            },
          ]
        : [],
    ...(index === 7 ? {} : { poster: image }),
    ...(index === 0 ? { img: image } : {}),
    ...(index < 3 ? { sign_up: `https://example.com/events/${index}` } : {}),
  }));
}

/** Production query evaluated over fixtures; mock mode follows the real query shape. */
export async function getMockEvents(now: Date = new Date()): Promise<Event[]> {
  const result = await evaluateMockQuery<Event[]>(EVENTS_QUERY, {}, [
    ...getMockContentDocuments(),
    ...getMockEventDocuments(now),
  ]);
  return result.map(omitNulls);
}

/** Both statuses, optional publication and an absent image exercise research states. */
export async function getMockResearchProjects(): Promise<ResearchProject[]> {
  const docs: CmsFixtureDocument[] = [
    {
      _id: "fixture-research-ongoing",
      _type: "research",
      title: "Example lab: Synthetic planning",
      desc: "An example research project.",
      status: "ongoing",
      keywords: ["Planning"],
      img: image,
      institutions: [
        {
          _type: "reference",
          _key: "example",
          _ref: "organization-example-company",
        },
      ],
    },
    {
      _id: "fixture-research-complete",
      _type: "research",
      title: "Example lab: Synthetic evaluation",
      desc: "A completed example project.",
      status: "completed",
      keywords: ["Evaluation"],
      publication: "https://example.com/paper",
    },
  ];
  const result = await evaluateMockQuery<ResearchProject[]>(
    RESEARCH_QUERY,
    {},
    [...getMockContentDocuments(), ...docs],
  );
  return result.map(omitNulls);
}
