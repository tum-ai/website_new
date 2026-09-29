import { ButtonLink, PageHero, Photo } from "@/components/ds";
import { ClosingSection } from "./closing-section";
import { getCommunityContent } from "./content";
import { stories } from "./data/member-stories";
import { DepartmentsSection } from "./departments-section";
import { MemberStories } from "./member-stories";
import { SemesterPlan } from "./semester-plan";

/**
 * /community, for prospective members first and partners second: who runs
 * TUM.ai, then the membership as a semester timetable (the page's one bold
 * element), the departments behind the initiative track, the members' own
 * stories, and a close that returns to semester zero. The copy, journey and
 * departments come from the content slice (`content.ts`: the CMS or code).
 */
export async function CommunityPage() {
  const { copy, journey, departments } = await getCommunityContent();
  const { photo } = copy.hero;
  return (
    <main>
      <PageHero
        titleId="community-hero-title"
        title={copy.hero.title}
        emphasis="highlight"
        lead={copy.hero.lead}
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
            src={photo.src}
            alt={photo.alt}
            position={photo.objectPosition}
            caption={copy.hero.photoCaption}
            eager
            sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 44vw, 92vw"
          />
        }
      />
      <SemesterPlan copy={copy.journey} journey={journey} />
      <DepartmentsSection copy={copy.departments} departments={departments} />
      <MemberStories stories={stories} />
      <ClosingSection copy={copy.closing} />
    </main>
  );
}
