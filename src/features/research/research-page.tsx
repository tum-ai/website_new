import {
  ButtonLink,
  Container,
  Display,
  EmptyState,
  LogoWall,
  PageHero,
  Reveal,
  Section,
  SectionHeader,
  Steps,
  Text,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import { getResearchPartners } from "@/features/partners/server";
import type { ResearchProject } from "@/lib/types";
import { AffiliationIndex } from "./affiliations";
import { getLabSiteList, getResearchCopy } from "./content";
import { getAbstractBody } from "./data/research-copy";
import { ProjectList, ReferenceList } from "./project-list";
import { getLabSites, getPartnerLogos, getResearchIndex } from "./research";
import { ResearchFigure } from "./research-figure";
import { ResearchGlobe } from "./research-globe";
import { getRexInstitutions } from "./rex-content";

/**
 * The /research page, set like a paper's first page. The hero is the title
 * block: every institution named on a CMS project, numbered, and each
 * project below cites them by number. Completed projects form the
 * references list, REX follows on lavender, and the closing band repeats the
 * affiliation line with one open slot for the next lab. The copy and the
 * lab sites come from the content slice (`content.ts`), the REX
 * institutions from theirs (`rex-content.ts`) and the research partners
 * (the partner organisations in the "Research Partners" category) from the
 * partners' organisation slice: each the CMS or the code.
 */
export async function ResearchPage({
  projects,
}: {
  /** Research projects from the CMS, in CMS order. */
  projects: ResearchProject[];
}) {
  const [copy, rexInstitutions, labSites, researchPartners] = await Promise.all(
    [
      getResearchCopy(),
      getRexInstitutions(),
      getLabSiteList(),
      getResearchPartners(),
    ],
  );
  const { closing, rex } = copy;
  const { affiliations, ongoing, completed } = getResearchIndex(projects);
  const partnerLogos = getPartnerLogos(researchPartners);
  const { sites } = getLabSites(
    [
      ...affiliations,
      ...researchPartners.map(({ name }) => name),
      ...rexInstitutions.map(({ name }) => name),
    ],
    labSites,
  );

  return (
    <main>
      <PageHero
        tone="night"
        mark={false}
        titleId="research-title"
        title={copy.hero.title}
        emphasis="highlight"
        lead={copy.hero.lead}
        actions={
          <>
            <ButtonLink href="/partners#partner-contact" size="lg">
              {callToActionLabels.partner}
            </ButtonLink>
            <ButtonLink href="/apply" size="lg" variant="outline" arrow>
              {callToActionLabels.member}
            </ButtonLink>
          </>
        }
        media={
          <ResearchGlobe
            sites={sites}
            className="mx-auto w-full max-w-md lg:max-w-none"
          />
        }
        classNames={{
          grid: "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center",
        }}
      >
        {affiliations.length > 0 ? (
          <AffiliationIndex
            id="hero-affiliations"
            label="Affiliations"
            affiliations={affiliations}
            className="border-hairline border-t pt-8 md:pt-10"
          />
        ) : null}
      </PageHero>

      <Section
        tone="paper"
        spacing="xl"
        id="abstract"
        aria-labelledby="abstract-title"
      >
        {partnerLogos.length > 0 ? (
          <Container className="mb-24 md:mb-32">
            {/* The list below carries the same name for assistive tech. */}
            <p aria-hidden="true" className="text-fg-subtle text-meta">
              {copy.partnersLabel}
            </p>
            <Reveal variant="fade">
              <LogoWall
                layout="strip"
                logos={partnerLogos}
                label={copy.partnersLabel}
                className="mt-8 border-hairline border-b pb-16 md:pb-20"
              />
            </Reveal>
          </Container>
        ) : null}
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h2 id="abstract-title" className="text-fg-subtle text-meta">
              {copy.abstract.label}
            </h2>
            <Display as="p" size="md" className="mt-6 max-w-[16em]">
              {copy.abstract.statement}
            </Display>
            <Text size="lead" className="mt-8 max-w-xl">
              {getAbstractBody(ongoing.length, copy.abstract)}
            </Text>
          </div>
          <Reveal className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <ResearchFigure panels={copy.figurePanels} />
          </Reveal>
        </Container>
      </Section>

      <Section
        tone="paper"
        spacing="none"
        id="projects"
        aria-labelledby="projects-title"
        className="scroll-mt-header pb-28 md:pb-40"
      >
        <Container>
          <SectionHeader
            id="projects-title"
            title={copy.ongoing.title}
            count={ongoing.length}
            layout="stack"
          />
          {ongoing.length > 0 ? (
            <ProjectList projects={ongoing} />
          ) : (
            <EmptyState title={copy.ongoing.empty} />
          )}
        </Container>
      </Section>

      {completed.length > 0 ? (
        <Section
          tone="mist"
          spacing="xl"
          id="publications"
          aria-labelledby="publications-title"
          className="scroll-mt-header"
        >
          <Container>
            <SectionHeader
              id="publications-title"
              title={copy.completed.title}
              count={completed.length}
              layout="stack"
              lead={copy.completed.lead}
            />
            <ReferenceList projects={completed} />
          </Container>
        </Section>
      ) : null}

      <Section
        tone="lavender"
        spacing="xl"
        id="rex"
        aria-labelledby="rex-title"
        className="scroll-mt-header"
      >
        <Container>
          <SectionHeader
            id="rex-title"
            title={rex.title}
            layout="stack"
            lead={rex.lead}
          />
          {/* The list below carries the same name for assistive tech. */}
          <p aria-hidden="true" className="text-fg-subtle text-meta">
            {rex.logosLabel}
          </p>
          <LogoWall
            layout="strip"
            logos={rexInstitutions.map(({ shortName: _, ...logo }) => logo)}
            label={rex.logosLabel}
            className="mt-8"
          />

          <div className="mt-20 grid gap-14 md:mt-28 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h3 className="text-fg-subtle text-meta">{rex.processTitle}</h3>
              {/* "We" opens the sentence the steps complete. */}
              <p className="mt-6 font-light text-display-md text-fg">We</p>
              <Steps
                layout="rows"
                headingAs="h4"
                className="mt-6"
                items={rex.process.map((clause) => ({ title: clause }))}
              />
            </div>
            <Reveal className="lg:col-span-3 lg:col-start-10 lg:pt-12">
              <Text className="max-w-md">{rex.origin}</Text>
              <ButtonLink
                href="/apply"
                className="mt-8"
                variant="outline"
                arrow
              >
                {callToActionLabels.member}
              </ButtonLink>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section
        tone="ink"
        spacing="xl"
        aria-labelledby="closing-title"
        className="overflow-clip"
      >
        <Container>
          <Reveal>
            <h2
              id="closing-title"
              className="max-w-[12em] text-display-lg text-highlight"
            >
              {closing.title}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <AffiliationIndex
              id="closing-affiliations"
              label="Affiliations"
              affiliations={affiliations}
              openSlot={closing.openSlot}
              className="mt-12 border-hairline border-t pt-8 md:mt-16"
            />
          </Reveal>
          <div className="mt-16 grid border-hairline-strong border-t md:mt-24 md:grid-cols-2">
            {[
              {
                ...closing.partner,
                action: (
                  <ButtonLink href="/partners#partner-contact">
                    {callToActionLabels.partner}
                  </ButtonLink>
                ),
              },
              {
                ...closing.student,
                action: (
                  <ButtonLink href="/apply" variant="outline" arrow>
                    {callToActionLabels.member}
                  </ButtonLink>
                ),
              },
            ].map((fork, position) => (
              <Reveal
                key={fork.audience}
                delay={position * 100}
                className="border-hairline py-8 max-md:not-last:border-b md:py-10 md:even:border-l md:even:pl-12 md:odd:pr-12"
              >
                <p className="text-fg-subtle text-meta">{fork.audience}</p>
                <p className="mt-3 max-w-md text-fg text-heading-md">
                  {fork.text}
                </p>
                <div className="mt-8">{fork.action}</div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
