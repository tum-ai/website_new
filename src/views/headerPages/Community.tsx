import Image from "next/image";
import MemberStories from "@/components/apply/MemberStories";
import { DepartmentsSection } from "@/components/community/DepartmentsSection";
import { JourneySection } from "@/components/community/JourneySection";
import { ButtonLink, CtaBand, Highlight, PageHero } from "@/components/ds";
import { stories } from "@/data/apply/applyData";

/** Hero media: an onboarding group photo in the brand's signature shape. */
function HeroPhoto() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-signature bg-sunken ring-1 ring-white/10 lg:ml-6">
      <Image
        src="/assets/homepage/Onboarding25.webp"
        alt="A new TUM.ai batch in matching black T-shirts gathered for a group photo at onboarding"
        fill
        preload
        sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 44vw, 92vw"
        className="object-cover"
      />
    </div>
  );
}

export default function Community() {
  return (
    <main>
      <PageHero
        titleId="community-hero-title"
        // An array (not a fragment) so SplitWords animates word by word.
        title={[
          "The TUM.ai ",
          <Highlight key="member">Member</Highlight>,
          " ",
          <Highlight key="journey">Journey</Highlight>,
        ]}
        lead="At TUM.ai, members contribute through AI projects, workshops, and community initiatives - turning bold ideas into real-world impact."
        actions={
          <>
            <ButtonLink href="/apply" size="lg" arrow>
              Become a Member
            </ButtonLink>
            <ButtonLink
              href="#memberStories"
              variant="outline"
              size="lg"
              arrow="down"
            >
              Member Stories
            </ButtonLink>
          </>
        }
        media={<HeroPhoto />}
      />
      <JourneySection />
      <DepartmentsSection />
      <MemberStories stories={stories} />
      <CtaBand
        titleId="community-cta-title"
        eyebrow="Join us"
        title={
          <>
            Become a <Highlight>Member</Highlight>
          </>
        }
        actions={
          <ButtonLink href="/apply" size="lg" arrow>
            Apply now
          </ButtonLink>
        }
      />
    </main>
  );
}
