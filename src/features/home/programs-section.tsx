import {
  Container,
  IndexList,
  type IndexListItem,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import { isUnoptimizedRemoteImage } from "@/lib/image-optimization";

/** The five ways into TUM.ai as a typographic index with photo previews. */
export function ProgramsSection({
  title,
  lead,
  items,
}: {
  title: string;
  lead: string;
  /** The programs with their page tokens filled (`homeView`). */
  items: IndexListItem[];
}) {
  return (
    <Section
      tone="paper"
      spacing="none"
      id="programs"
      aria-labelledby="programs-title"
      className="pb-28 md:pb-44"
    >
      <Container>
        <SectionHeader
          id="programs-title"
          title={title}
          size="lg"
          lead={lead}
        />
        <IndexList
          items={items.map((item) => ({
            ...item,
            image: item.image
              ? {
                  ...item.image,
                  unoptimized:
                    item.image.unoptimized ??
                    isUnoptimizedRemoteImage(item.image.src),
                }
              : undefined,
          }))}
        />
      </Container>
    </Section>
  );
}
