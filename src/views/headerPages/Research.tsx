import {
  Aurora,
  BrandMark,
  Container,
  EmptyState,
  Eyebrow,
  type LogoItem,
  LogoWall,
  PageHero,
  Reveal,
  Section,
  SectionHeader,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ds";
import ResearchCard from "@/components/research/ResearchCard";
import type { Partner, Research as ResearchProject } from "@/lib/types";

/* The REX copy names these labs; the grid repeats them as typography. */
const rexInstitutions = ["Harvard", "MIT", "Cambridge", "INRIA"];

/* One sentence of the REX copy, split at its commas into a visual process. */
const rexProcess = [
  "collect project proposals from our partners,",
  "inform members about the requirements and usual processes,",
  "preselect applicants based on prior relevant (research) experience,",
  "recommend them to our partner labs,",
  "and eventually support their journey abroad with alumni experience in visa processes, housing, etc.",
];

const pad = (value: number) => String(value).padStart(2, "0");

function logoColumns(count: number) {
  if (count >= 6) return 6;
  if (count === 5) return 5;
  if (count === 4) return 4;
  return 3;
}

export default function Research({
  initialProjects = [],
  researchPartners = [],
}: {
  initialProjects?: ResearchProject[];
  researchPartners?: Partner[];
}) {
  // Projects without a status are intentionally not listed.
  const ongoingProjects = initialProjects.filter(
    (project) => project.status === "ongoing",
  );
  const pastProjects = initialProjects.filter(
    (project) => project.status === "completed",
  );
  const collaborators: LogoItem[] = (
    Array.isArray(researchPartners) ? researchPartners : []
  )
    .filter((partner) => partner.link && partner.image)
    .map((partner) => ({
      name: partner.name,
      src: partner.image,
      href: partner.link,
      alt: partner.name,
    }));

  return (
    <main>
      <Tabs defaultValue="projects">
        <PageHero
          title="Research"
          lead="Our research offerings - from projects to exchange programs"
        >
          <TabsList aria-label="Research tabs" activateOnFocus>
            <TabsTab
              value="projects"
              className="max-sm:h-auto max-sm:min-h-10 max-sm:shrink max-sm:py-2 max-sm:leading-tight max-sm:whitespace-normal"
            >
              Projects
            </TabsTab>
            <TabsTab
              value="exchange"
              className="max-sm:h-auto max-sm:min-h-10 max-sm:shrink max-sm:py-2 max-sm:leading-tight max-sm:whitespace-normal"
            >
              Research Exchange Program
            </TabsTab>
          </TabsList>
        </PageHero>

        <TabsPanel value="projects" keepMounted>
          <Section
            tone="paper"
            spacing="lg"
            aria-labelledby="ongoing-projects-title"
          >
            <Container>
              <SectionHeader
                id="ongoing-projects-title"
                eyebrow="Current work"
                index={1}
                title="Ongoing Projects"
              />
              {ongoingProjects.length > 0 ? (
                <ul className="grid gap-5 lg:grid-cols-3 xl:gap-6">
                  {ongoingProjects.map((project, index) => (
                    <Reveal
                      as="li"
                      key={project.id || project.title}
                      delay={(index % 3) * 90}
                    >
                      <ResearchCard
                        title={project.title}
                        description={project.description}
                        image={project.image}
                        publication={project.publication}
                        keywords={project.keywords}
                        status={project.status}
                        index={index}
                      />
                    </Reveal>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No ongoing projects" />
              )}
            </Container>
          </Section>

          {pastProjects.length > 0 ? (
            <Section
              tone="mist"
              spacing="lg"
              aria-labelledby="past-projects-title"
            >
              <Container>
                <SectionHeader
                  id="past-projects-title"
                  eyebrow="Archive"
                  index={2}
                  title="Past Projects"
                />
                <ul className="border-t border-hairline">
                  {pastProjects.map((project, index) => (
                    <Reveal
                      as="li"
                      key={project.id || project.title}
                      delay={Math.min(index, 4) * 60}
                      className="border-b border-hairline"
                    >
                      <ResearchCard
                        layout="row"
                        title={project.title}
                        description={project.description}
                        image={project.image}
                        publication={project.publication}
                        keywords={project.keywords}
                        status={project.status}
                        index={index}
                      />
                    </Reveal>
                  ))}
                </ul>
              </Container>
            </Section>
          ) : null}

          {collaborators.length > 0 ? (
            <Section
              tone="ink"
              spacing="lg"
              grain
              aria-labelledby="collaborators-title"
              className="overflow-clip"
            >
              <Aurora intensity="subtle" />
              <Container>
                <SectionHeader
                  id="collaborators-title"
                  eyebrow="Research partners"
                  index={pastProjects.length > 0 ? 3 : 2}
                  title="Collaborators"
                />
                <Reveal variant="fade" delay={120}>
                  <LogoWall
                    logos={collaborators}
                    columns={logoColumns(collaborators.length)}
                    size="lg"
                    // Six logos: 3 + 3 on tablets instead of 4 + 2.
                    className={
                      collaborators.length === 6 ? "md:grid-cols-3" : undefined
                    }
                  />
                </Reveal>
              </Container>
            </Section>
          ) : null}
        </TabsPanel>

        <TabsPanel value="exchange" keepMounted>
          <Section tone="paper" spacing="lg" aria-labelledby="rex-title">
            <Container>
              {/* Split rhythm as in SectionHeader: title and lead share a
                  bottom line. */}
              <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
                <div className="lg:col-span-5">
                  <Reveal>
                    <Eyebrow index={1}>Research abroad</Eyebrow>
                  </Reveal>
                  <Reveal delay={60}>
                    <h2 id="rex-title" className="mt-5 text-display-md text-fg">
                      Research Exchange (REX) Program
                    </h2>
                  </Reveal>
                </div>
                <Reveal delay={140} className="lg:col-span-7">
                  <p className="text-lead text-fg-muted">
                    Our Research Exchange (REX) Program provides TUM.ai members
                    with opportunities to conduct research abroad. Offers range
                    from final theses to research internships with leading labs
                    at institutions like
                    <span className="font-semibold text-fg">
                      {" "}
                      Harvard, MIT, Cambridge,
                    </span>{" "}
                    or <span className="font-semibold text-fg">INRIA</span>.
                  </p>
                </Reveal>
              </div>

              <ul
                aria-hidden
                className="mt-16 grid grid-cols-2 border-y border-hairline-strong md:mt-24 lg:grid-cols-4"
              >
                {rexInstitutions.map((name, index) => (
                  <Reveal
                    as="li"
                    key={name}
                    delay={index * 90}
                    className="min-w-0 border-hairline py-7 max-lg:odd:border-r max-lg:odd:pr-5 max-lg:even:pl-5 max-lg:[&:nth-child(-n+2)]:border-b md:py-9 lg:border-l lg:py-10 lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
                  >
                    <span className="tabular text-meta text-fg-subtle">
                      {pad(index + 1)}
                    </span>
                    <span className="mt-8 block text-[clamp(1.375rem,7vw,2rem)] font-light text-fg sm:text-display-md lg:mt-14">
                      {name}
                    </span>
                  </Reveal>
                ))}
              </ul>
            </Container>
          </Section>

          <Section as="div" tone="lavender" spacing="lg">
            <Container>
              <Reveal>
                <Eyebrow as="h3" index={2} className="mb-10 md:mb-14">
                  How it works
                </Eyebrow>
              </Reveal>
              {/* "We" opens the sentence the list completes; its top lines up
                  with the first clause (same padding as a list row). */}
              <div className="grid gap-4 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-4">
                  <Reveal delay={60} className="lg:sticky lg:top-32 lg:pt-8">
                    <p className="text-display-xl font-light text-fg">We</p>
                  </Reveal>
                </div>
                <ol className="border-t border-hairline-strong lg:col-span-8">
                  {rexProcess.map((step, index) => (
                    <Reveal
                      as="li"
                      key={step}
                      delay={index * 70}
                      className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-3 border-b border-hairline-strong py-6 md:grid-cols-[4.5rem_minmax(0,1fr)] md:py-8"
                    >
                      <span className="tabular text-meta font-semibold text-highlight">
                        {pad(index + 1)}
                      </span>
                      <span className="text-heading-md font-normal text-fg md:text-heading-lg md:font-light">
                        {step}
                      </span>
                    </Reveal>
                  ))}
                </ol>
              </div>
            </Container>
          </Section>

          <Section
            as="div"
            tone="ink"
            spacing="xl"
            grain
            className="overflow-clip"
          >
            <Aurora intensity="subtle" />
            <BrandMark className="absolute -right-[14%] -bottom-[38%] -z-10 w-[min(60rem,95%)] text-white/[0.035]" />
            <Container>
              <Reveal>
                <Eyebrow as="h3" index={3}>
                  Origin
                </Eyebrow>
              </Reveal>
              <Reveal delay={60}>
                <p className="mt-8 max-w-4xl text-display-md font-light text-fg">
                  REX was launched based on the observation that members were
                  already conducting research abroad and recommending others to
                  follow in their footsteps.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-10 max-w-2xl text-lead text-fg-muted">
                  It is therefore a testament to our tight-knit community that
                  we could build a network of great researchers who eagerly
                  introduce our members to their respective fields and trust
                  TUM.ai to provide curious minds.
                </p>
              </Reveal>
            </Container>
          </Section>
        </TabsPanel>
      </Tabs>
    </main>
  );
}
