import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import { organizationFacts } from "@/config/organization";
import {
  type Milestone,
  milestoneKinds,
  milestones,
  milestonesIn,
  milestoneYears,
} from "./data/milestones";

/** One entry: a square per milestone (so a cell's density shows), its words. */
function Entry({ milestone }: { milestone: Milestone }) {
  return (
    <li className="flex gap-2.5">
      <span
        aria-hidden="true"
        className="mt-[0.45em] size-1.5 shrink-0 bg-highlight"
      />
      <span>
        <span className="block text-fg text-small">{milestone.title}</span>
        {milestone.detail ? (
          <span className="mt-0.5 block text-fg-subtle text-meta">
            {milestone.detail}
          </span>
        ) : null}
      </span>
    </li>
  );
}

/**
 * The previous editions as a conference programme grid: a row per kind of
 * work, a column per year, and in each cell what members started. Built
 * from the milestone data, so the grid visibly fills up as the initiative
 * grew. A table from `lg`; below it, one stack per year with each entry's
 * kind named.
 */
export function SinceFounding() {
  return (
    <Section tone="lavender" spacing="lg" aria-labelledby="apply-history-title">
      <Container>
        <SectionHeader
          id="apply-history-title"
          title={`Since ${organizationFacts.foundingYear}`}
          size="lg"
          layout="stack"
          lead={`What TUM.ai's members have started, by kind and year: ${milestones.length} milestones in ${milestoneYears.length} years.`}
        />

        <Reveal variant="fade" className="hidden lg:block">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">
              Milestones by kind of work and year
            </caption>
            <colgroup>
              <col className="w-44" />
              {milestoneYears.map((year) => (
                <col key={year} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-hairline-strong border-b">
                <td />
                {milestoneYears.map((year) => (
                  <th
                    key={year}
                    scope="col"
                    className="tabular border-hairline border-l px-4 pb-5 align-bottom font-normal text-fg text-heading-md"
                  >
                    {year}
                    <span
                      aria-hidden="true"
                      className="mt-3 flex flex-wrap gap-1"
                    >
                      {milestones
                        .filter((milestone) => milestone.year === year)
                        .map((milestone) => (
                          <span
                            key={milestone.title}
                            className="size-2 bg-highlight"
                          />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {milestoneKinds.map((kind) => (
                <tr key={kind.id} className="border-hairline border-b">
                  <th
                    scope="row"
                    className="py-6 pr-4 align-top font-medium text-fg-muted text-small"
                  >
                    {kind.label}
                  </th>
                  {milestoneYears.map((year) => {
                    const entries = milestonesIn(kind.id, year);
                    return (
                      <td
                        key={year}
                        className="border-hairline border-l px-4 py-6 align-top"
                      >
                        {entries.length ? (
                          <ul className="grid gap-4">
                            {entries.map((milestone) => (
                              <Entry
                                key={milestone.title}
                                milestone={milestone}
                              />
                            ))}
                          </ul>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <ol className="border-hairline-strong border-t lg:hidden">
          {milestoneYears.map((year) => (
            <Reveal
              as="li"
              key={year}
              className="grid gap-5 border-hairline border-b py-8 sm:grid-cols-[6rem_minmax(0,1fr)]"
            >
              <h3 className="tabular text-fg text-heading-md">{year}</h3>
              <ul className="grid gap-4">
                {milestoneKinds.flatMap((kind) =>
                  milestonesIn(kind.id, year).map((milestone) => (
                    <li key={milestone.title}>
                      <span className="block text-fg-subtle text-meta">
                        {kind.label}
                      </span>
                      <span className="mt-0.5 block text-fg text-small">
                        {milestone.title}
                        {milestone.detail ? (
                          <span className="text-fg-muted">
                            . {milestone.detail}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  )),
                )}
              </ul>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
