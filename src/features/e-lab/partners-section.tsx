import {
  Container,
  LogoWall,
  Reveal,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import { isUnoptimizedRemoteImage } from "@/lib/image-optimization";
import { getLogoLists } from "@/lib/organization-content";
import type { Organization } from "@/lib/people-and-logos";
import type { ELabCopy } from "./data/copy";

/** An organisation's light logo as a wall item; without artwork, its name. */
function logoOf({ name, href, logo }: Organization) {
  return {
    name,
    ...(href ? { href } : {}),
    ...(logo
      ? {
          src: logo.src,
          alt: logo.alt,
          unoptimized: isUnoptimizedRemoteImage(logo.src),
          aspectRatio: logo.aspectRatio ?? logo.width / logo.height,
          ...(logo.symbolOnly ? { wordmark: name } : {}),
        }
      : {}),
  };
}

/**
 * The program's partners in three tiers, each its own logo list: the
 * cohort's iteration partners largest and in colour, its workshop partners
 * smaller, and past partners as a compact greyscale strip. A tier without
 * logos is left out, and the band hides when all three are empty.
 */
export async function PartnersSection({
  copy,
}: {
  copy: ELabCopy["partners"];
}) {
  const lists = await getLogoLists({
    surfaces: [
      "e-lab-iteration-partners",
      "e-lab-workshop-partners",
      "e-lab-past-partners",
    ],
    label: "ELAB partners",
  });
  const iteration = lists["e-lab-iteration-partners"].map(logoOf);
  const workshop = lists["e-lab-workshop-partners"].map(logoOf);
  const past = lists["e-lab-past-partners"].map(logoOf);
  if (!iteration.length && !workshop.length && !past.length) return null;
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="elab-partners-title">
      <Container>
        <SectionHeader
          id="elab-partners-title"
          title={copy.title}
          size="lg"
          layout="stack"
          lead={copy.lead}
        />
        <div className="space-y-14 md:space-y-16">
          {iteration.length ? (
            <Reveal>
              <h3 className="font-semibold text-fg text-small">
                {copy.iterationLabel}
              </h3>
              <LogoWall
                logos={iteration}
                columns={5}
                size="xl"
                label={copy.iterationLabel}
                className="mt-6"
              />
            </Reveal>
          ) : null}
          {workshop.length ? (
            <Reveal>
              <h3 className="font-semibold text-fg text-small">
                {copy.workshopLabel}
              </h3>
              <LogoWall
                logos={workshop}
                columns={6}
                size="md"
                label={copy.workshopLabel}
                className="mt-6"
              />
            </Reveal>
          ) : null}
          {past.length ? (
            <Reveal className="border-hairline-strong border-t pt-8 md:pt-10">
              <h3 className="font-semibold text-fg text-small">
                {copy.pastLabel}
              </h3>
              <LogoWall
                layout="strip"
                logos={past}
                label={copy.pastLabel}
                className="mt-8"
              />
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
