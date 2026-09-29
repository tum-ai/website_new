import Image from "next/image";
import {
  Container,
  QuoteMark,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { MemberStory } from "./data/member-stories";

interface MemberStoriesProps {
  stories: MemberStory[];
}

/**
 * Member testimonials on /community, set as an editorial two-column list.
 * The band keeps `id="memberStories"`: the homepage links to
 * /community#memberStories.
 */
export function MemberStories({ stories }: MemberStoriesProps) {
  return (
    <Section
      tone="lavender"
      spacing="lg"
      id="memberStories"
      aria-labelledby="member-stories-title"
      className="scroll-mt-header"
    >
      <Container>
        <SectionHeader
          id="member-stories-title"
          title="In their own words"
          size="lg"
          layout="stack"
          lead="Members on what they did with their time at TUM.ai."
        />
        <ul className="grid gap-x-16 gap-y-14 md:grid-cols-2 md:gap-y-20 xl:gap-x-24">
          {stories.map((story, index) => (
            <Reveal as="li" key={story.name} delay={(index % 2) * 100}>
              <figure className="flex h-full flex-col border-hairline-strong border-t pt-8 md:pt-10">
                <QuoteMark className="h-5 w-7 text-highlight" />
                <blockquote className="mt-5 flex-1 text-fg text-lead">
                  <p>{story.story}</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-sunken">
                    <Image
                      src={story.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-fg text-small">
                      {story.name}
                    </h3>
                    <p className="mt-0.5 text-fg-muted text-meta">
                      {story.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
