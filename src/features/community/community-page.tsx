import { ButtonLink, PageHero, Photo } from "@/components/ds";
import { organizationFacts } from "@/config/organization";
import { ClosingSection } from "./closing-section";
import { stories } from "./data/member-stories";
import { DepartmentsSection } from "./departments-section";
import { MemberStories } from "./member-stories";
import { SemesterPlan } from "./semester-plan";

const { activeMembers, majors, nationalities } = organizationFacts;

/**
 * /community, for prospective members first and partners second: who runs
 * TUM.ai, then the membership as a semester timetable (the page's one bold
 * element), the departments behind the initiative track, the members' own
 * stories, and a close that returns to semester zero.
 */
export function CommunityPage() {
  return (
    <main>
      <PageHero
        titleId="community-hero-title"
        title="The people who run TUM.ai."
        emphasis="highlight"
        lead={`${activeMembers}+ active members from ${majors}+ majors and ${nationalities}+ nationalities organize our research, events and startup program themselves. This page shows what membership looks like, from the first weekend to the alumni network.`}
        actions={
          <>
            <ButtonLink href="/apply" size="lg" arrow>
              Become a Member
            </ButtonLink>
            <ButtonLink href="/partners" size="lg" variant="outline">
              Become a Partner
            </ButtonLink>
          </>
        }
        media={
          <Photo
            src="/assets/homepage/Onboarding25.webp"
            alt="A new TUM.ai batch in matching black T-shirts gathered for a group photo at the kickoff"
            // TODO(content): confirm this is the kickoff of a new batch; the
            // date is the one on the projector in the photo.
            caption="Kickoff, May 16, 2025"
            eager
            sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 44vw, 92vw"
          />
        }
      />
      <SemesterPlan />
      <DepartmentsSection />
      <MemberStories stories={stories} />
      <ClosingSection />
    </main>
  );
}
