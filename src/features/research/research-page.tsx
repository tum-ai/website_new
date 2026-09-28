import {
  Aurora,
  BrandMark,
  Container,
  EmptyState,
  Eyebrow,
  LogoWall,
  PageHero,
  Reveal,
  Section,
  SectionHeader,
  Steps,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ds";
import type { Partner, ResearchProject } from "@/lib/types";
import { rexInstitutions, rexProcess } from "./data/rex";
import {
  formatCounter,
  getCollaboratorLogos,
  getLogoColumns,
  getResearchProjectLists,
} from "./research";
import { ResearchCard } from "./research-card";

/** The /research page: CMS projects and collaborators, and the REX program. */
export function ResearchPage({
  projects,
  researchPartners,
}: {
  /** Research projects from the CMS, in CMS order. */
  projects: ResearchProject[];
  /** Partners in the "Research Partners" category. */
  researchPartners: Partner[];
}) {
  const { ongoing, past } = getResearchProjectLists(projects);
  const collaborators = getCollaboratorLogos(researchPartners);

  return (
    <main>
      <Tabs defaultValue="projects">
        <PageHero
          title="Research"
          lead="Our research offerings - from projects to exchange programs"
        >
          <TabsList aria-label="Research tabs" activateOnFocus>
            <TabsTab value="projects">Projects</TabsTab>
            <TabsTab value="exchange">Research Exchange Program</TabsTab>
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
              {ongoing.length > 0 ? (
                <ul className="grid gap-5 lg:grid-cols-3 xl:gap-6">
                  {ongoing.map((project, index) => (
                    <Reveal as="li" key={project.id} delay={(index % 3) * 90}>
                      <ResearchCard project={project} index={index} />
                    </Reveal>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No ongoing projects" />
              )}
            </Container>
          </Section>

          {past.length > 0 ? (
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
                <ul className="border-hairline border-t">
                  {past.map((project, index) => (
                    <Reveal
                      as="li"
                      key={project.id}
                      delay={Math.min(index, 4) * 60}
                      className="border-hairline border-b"
                    >
                      <ResearchCard
                        layout="row"
                        project={project}
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
                  index={past.length > 0 ? 3 : 2}
                  title="Collaborators"
                />
                <Reveal variant="fade" delay={120}>
                  <LogoWall
                    logos={collaborators}
                    columns={getLogoColumns(collaborators.length)}
                    size="xl"
                  />
                </Reveal>
              </Container>
            </Section>
          ) : null}
        </TabsPanel>

        <TabsPanel value="exchange" keepMounted>
          <Section tone="paper" spacing="lg" aria-labelledby="rex-title">
            <Container>
              <SectionHeader
                id="rex-title"
                eyebrow="Research abroad"
                index={1}
                title="Research Exchange (REX) Program"
                classNames={{ aside: "lg:max-w-2xl" }}
                lead={
                  <>
                    Our Research Exchange (REX) Program provides TUM.ai members
                    with opportunities to conduct research abroad. Offers range
                    from final theses to research internships with leading labs
                    at institutions like{" "}
                    <span className="font-semibold text-fg">
                      Harvard, MIT, Cambridge,
                    </span>{" "}
                    or <span className="font-semibold text-fg">INRIA</span>.
                  </>
                }
              />

              <ul
                aria-hidden="true"
                className="grid grid-cols-2 border-hairline-strong border-y lg:grid-cols-4"
              >
                {rexInstitutions.map((name, index) => (
                  <Reveal
                    as="li"
                    key={name}
                    delay={index * 90}
                    className="min-w-0 border-hairline py-7 max-lg:even:pl-5 max-lg:odd:border-r max-lg:odd:pr-5 md:py-9 lg:border-l lg:py-10 lg:pl-6 lg:first:border-l-0 lg:first:pl-0 max-lg:[&:nth-child(-n+2)]:border-b"
                  >
                    <span className="tabular text-fg-subtle text-meta">
                      {formatCounter(index)}
                    </span>
                    <span className="mt-8 block font-light text-fg text-heading-lg sm:text-display-md lg:mt-14">
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
                <Eyebrow as="h3" index={2}>
                  How it works
                </Eyebrow>
              </Reveal>
              {/* "We" opens the sentence the steps complete. */}
              <Reveal delay={60}>
                <p className="mt-10 font-light text-display-lg text-fg md:mt-14">
                  We
                </p>
              </Reveal>
              <Steps
                items={rexProcess.map((clause) => ({ title: clause }))}
                columns={5}
                headingAs="h4"
                className="mt-10 md:mt-14"
              />
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
            <BrandMark
              className="absolute -right-[14%] -bottom-[38%] -z-10 w-[min(60rem,95%)]"
              intensity="subtle"
            />
            <Container>
              <Reveal>
                <Eyebrow as="h3" index={3}>
                  Origin
                </Eyebrow>
              </Reveal>
              <Reveal delay={60}>
                <p className="mt-8 max-w-4xl font-light text-display-md text-fg">
                  REX was launched based on the observation that members were
                  already conducting research abroad and recommending others to
                  follow in their footsteps.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-10 max-w-2xl text-fg-muted text-lead">
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
