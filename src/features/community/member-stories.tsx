import Image from "next/image";
import { Container, Reveal, Section, SectionHeader } from "@/components/ds";

interface Story {
  name: string;
  role: string;
  story: string;
  image: string;
}

interface MemberStoriesProps {
  stories: Story[];
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
      className="scroll-mt-[var(--header-height)]"
    >
      <Container>
        <SectionHeader
          id="member-stories-title"
          eyebrow="Stories"
          title="Member Stories"
        />
        <ul className="grid gap-x-16 gap-y-14 md:grid-cols-2 md:gap-y-20 xl:gap-x-24">
          {stories.map((story, index) => (
            <Reveal as="li" key={story.name} delay={(index % 2) * 100}>
              <figure className="group/story flex h-full flex-col border-t border-hairline-strong pt-8 md:pt-10">
                <svg
                  aria-hidden
                  viewBox="0 0 32 24"
                  className="h-5 w-7 text-highlight"
                  fill="currentColor"
                >
                  <path d="M0 24V14.4C0 6.24 4.32 1.44 12.96 0l1.44 3.36C9.6 4.8 7.2 7.68 7.2 12H13.2V24H0Zm18.8 0V14.4C18.8 6.24 23.12 1.44 31.76 0l1.44 3.36C28.4 4.8 26 7.68 26 12H32V24H18.8Z" />
                </svg>
                <blockquote className="mt-5 flex-1 text-lead text-fg">
                  <p>{story.story}</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-sunken ring-1 ring-hairline-strong transition-shadow duration-500 ease-brand group-hover/story:ring-violet-500 md:size-18">
                    <Image
                      src={story.image}
                      alt={`Portrait of ${story.name}`}
                      fill
                      sizes="72px"
                      className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/story:scale-[1.06] motion-reduce:transition-none"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-heading-md text-fg">{story.name}</h3>
                    <p className="mt-0.5 text-meta text-fg-subtle">
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
