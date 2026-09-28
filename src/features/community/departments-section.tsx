import Image from "next/image";
import {
  Aurora,
  Container,
  FeatureCard,
  IconBadge,
  Reveal,
  Section,
  SectionHeader,
  SpotlightCard,
} from "@/components/ds";
import { cn } from "@/lib/cn";
import { type Department, departments } from "./data/departments";

type FeaturedMedia = {
  src: string;
  alt: string;
  /** Breakpoint from which the tile spans two bento columns. */
  wideFrom: "md" | "lg";
  /** Tailwind object-position class for the crop. */
  position?: string;
};

/**
 * Two departments get a wide photo tile, which gives the bento its rhythm
 * (2 + 1 / 1 + 1 + 1 / 1 + 2 on desktop). Keyed by department name.
 */
const featured: Record<string, FeaturedMedia> = {
  Makeathon: {
    src: "/assets/homepage/Makeathon.webp",
    alt: "The Makeathon team posing together on stage in front of the Makeathon banner",
    wideFrom: "md",
    position: "object-[50%_80%]",
  },
  "Partners & Sponsors": {
    src: "/assets/open_ai_speaker_event.webp",
    alt: "A packed auditorium at a TUM.ai speaker event with OpenAI",
    wideFrom: "lg",
  },
};

/**
 * Layout of a featured tile once it spans two columns: photo bleeds to the
 * right edge (straight inner edge, clipped by the card radius) and the copy
 * steps up a size. Below that breakpoint it matches the plain FeatureCards.
 */
const wideClasses = {
  md: {
    card: "md:grid md:grid-cols-2",
    media: "md:order-last md:aspect-auto md:min-h-80",
    title: "md:text-heading-lg",
    copy: "md:mt-4 md:text-body",
  },
  lg: {
    card: "lg:grid lg:grid-cols-2",
    media: "lg:order-last lg:aspect-auto lg:min-h-80",
    title: "lg:text-heading-lg",
    copy: "lg:mt-4 lg:text-body",
  },
} as const;

const counter = (index: number) => String(index + 1).padStart(2, "0");

/** Wide bento tile: the department's copy beside an inset photo. */
function FeaturedDepartmentCard({
  department,
  index,
  media,
}: {
  department: Department;
  index: number;
  media: FeaturedMedia;
}) {
  const wide = wideClasses[media.wideFrom];
  return (
    <SpotlightCard
      variant="glass"
      padding="none"
      className={cn(
        "group/zoom flex h-full flex-col overflow-hidden",
        wide.card,
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden bg-sunken",
          wide.media,
        )}
      >
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
          className={cn("zoom-media object-cover", media.position)}
        />
      </div>
      <div className="flex flex-1 flex-col p-7 md:p-9">
        <div className="flex items-start justify-between gap-4">
          <IconBadge icon={department.icon} interactive />
          <span className="tabular text-fg-subtle text-meta">
            {counter(index)}
          </span>
        </div>
        <h3 className={cn("mt-7 text-fg text-heading-md", wide.title)}>
          {department.name}
        </h3>
        <p className={cn("mt-3 text-fg-muted text-small", wide.copy)}>
          {department.description}
        </p>
      </div>
    </SpotlightCard>
  );
}

/** "Our Core Departments": a spotlight bento on an ink band. */
export function DepartmentsSection() {
  return (
    <Section
      tone="ink"
      spacing="lg"
      grain
      id="departments"
      aria-labelledby="departments-title"
      className="overflow-clip"
    >
      <Aurora intensity="subtle" />
      <Container>
        <SectionHeader
          id="departments-title"
          eyebrow="Departments"
          title="Our Core Departments"
          lead="Discover the diverse teams that make TUM.ai thrive. Each department plays a crucial role in our mission to shape the future of AI."
        />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {departments.map((department, index) => {
            const media = featured[department.name];
            return (
              <Reveal
                as="li"
                key={department.name}
                delay={(index % 3) * 80}
                className={cn(
                  media?.wideFrom === "md" && "md:col-span-2",
                  media?.wideFrom === "lg" && "lg:col-span-2",
                )}
              >
                {media ? (
                  <FeaturedDepartmentCard
                    department={department}
                    index={index}
                    media={media}
                  />
                ) : (
                  <FeatureCard
                    variant="glass"
                    icon={department.icon}
                    title={department.name}
                    index={counter(index)}
                  >
                    <p>{department.description}</p>
                  </FeatureCard>
                )}
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
