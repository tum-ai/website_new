import Image from "next/image";
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
import type { Partner, ResearchProject } from "@/lib/types";
import { AffiliationIndex } from "./affiliations";
import {
  abstractFigure,
  abstractStatement,
  closing,
  getAbstractBody,
  heroLead,
} from "./data/research-copy";
import { rexInstitutions, rexLead, rexOrigin, rexProcess } from "./data/rex";
import { ProjectList, ReferenceList } from "./project-list";
import { getPartnerLogos, getResearchIndex } from "./research";

/**
 * The /research page, set like a paper's first page. The hero is the title
 * block: every institution named on a CMS project, numbered, and each
 * project below cites them by number. Completed projects form the
 * references list, REX follows on lavender, and the closing band repeats the
 * affiliation line with one open slot for the next lab.
 */
export function ResearchPage({
  projects,
  researchPartners,
}: {
  /** Research projects from the CMS, in CMS order. */
  projects: ResearchProject[];
  /** Partners in the "Research Partners" category. */
  researchPartners: Partner[];
}) {
  const { affiliations, ongoing, completed } = getResearchIndex(projects);
  const partnerLogos = getPartnerLogos(researchPartners);

  return (
    <main>
      <PageHero
        tone="night"
        backdrop="quiet"
        mark={false}
        titleId="research-title"
        title="Research"
        lead={heroLead}
        actions={
          <>
            <ButtonLink href="/partners#partner-contact" size="lg">
              Become a Partner
            </ButtonLink>
            <ButtonLink href="/apply" size="lg" variant="outline" arrow>
              Become a Member
            </ButtonLink>
          </>
        }
        classNames={{ title: "text-highlight" }}
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
              Research partners
            </p>
            <Reveal variant="fade">
              <LogoWall
                layout="strip"
                logos={partnerLogos}
                label="Research partners"
                className="mt-8 border-hairline border-b pb-16 md:pb-20"
              />
            </Reveal>
          </Container>
        ) : null}
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h2 id="abstract-title" className="text-fg-subtle text-meta">
              Abstract
            </h2>
            <Display as="p" size="md" className="mt-6 max-w-[16em]">
              {abstractStatement}
            </Display>
            <Text size="lead" className="mt-8 max-w-xl">
              {getAbstractBody(ongoing.length)}
            </Text>
          </div>
          <Reveal as="figure" className="lg:col-span-5 lg:col-start-8">
            <Image
              src={abstractFigure.src}
              width={abstractFigure.width}
              height={abstractFigure.height}
              alt={abstractFigure.alt}
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="aspect-[4/3] w-full rounded-4xl object-cover"
            />
            <figcaption className="mt-4 text-fg-muted text-small">
              <span className="font-semibold text-fg">Figure 1.</span>{" "}
              {abstractFigure.caption}
            </figcaption>
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
            title="In progress"
            count={ongoing.length}
            layout="stack"
          />
          {ongoing.length > 0 ? (
            <ProjectList projects={ongoing} />
          ) : (
            <EmptyState title="No ongoing projects" />
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
              title="Completed"
              count={completed.length}
              layout="stack"
              lead="Finished projects and the papers that came out of them."
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
            title="Research abroad"
            layout="stack"
            lead={rexLead}
          />
          <AffiliationIndex
            id="rex-institutions"
            numbered={false}
            label="Offers from labs at institutions like"
            affiliations={rexInstitutions}
          />

          <div className="mt-20 grid gap-14 md:mt-28 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h3 className="text-fg-subtle text-meta">How REX works</h3>
              {/* "We" opens the sentence the steps complete. */}
              <p className="mt-6 font-light text-display-md text-fg">We</p>
              <Steps
                layout="rows"
                headingAs="h4"
                className="mt-6"
                items={rexProcess.map((clause) => ({ title: clause }))}
              />
            </div>
            <Reveal className="lg:col-span-3 lg:col-start-10 lg:pt-12">
              <Text className="max-w-md">{rexOrigin}</Text>
              <ButtonLink
                href="/apply"
                className="mt-8"
                variant="outline"
                arrow
              >
                Become a Member
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
                    Become a Partner
                  </ButtonLink>
                ),
              },
              {
                ...closing.student,
                action: (
                  <ButtonLink href="/apply" variant="outline" arrow>
                    Become a Member
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
