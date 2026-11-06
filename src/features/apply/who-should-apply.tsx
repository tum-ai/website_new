import {
  Container,
  Photo,
  Reveal,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import {
  coverSizes,
  isUnoptimizedRemoteImage,
  PANORAMA_PHOTO_FRAMES,
} from "@/lib/image-optimization";
import type { ApplyCopy } from "./data/apply";

/**
 * The call's scope, as a call for papers states it: what is in scope (the
 * four qualities, set large) beside what is not required, then how members
 * work together in one line per value, and a batch photo. The lead is the
 * brand mission (`mission`, from the site facts).
 */
export function WhoShouldApply({
  copy,
  mission,
}: {
  copy: ApplyCopy["scope"];
  mission: string;
}) {
  const { qualities, notRequired, values, photo } = copy;
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-scope-title">
      <Container>
        <SectionHeader
          id="apply-scope-title"
          title={copy.title}
          size="lg"
          layout="stack"
          lead={mission}
        />

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h3
              id="apply-in-scope"
              className="text-small font-medium text-fg-muted"
            >
              {copy.inScopeTitle}
            </h3>
            <dl
              aria-labelledby="apply-in-scope"
              className="mt-5 border-t border-hairline-strong"
            >
              {qualities.map((quality) => (
                <div
                  key={quality.title}
                  className="border-b border-hairline py-5 md:py-6"
                >
                  <dt className="text-display-md text-fg">{quality.title}</dt>
                  <dd className="mt-2 text-small text-fg-muted">
                    {quality.text}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
            <h3
              id="apply-not-required"
              className="text-small font-medium text-fg-muted"
            >
              {copy.notRequiredTitle}
            </h3>
            <dl
              aria-labelledby="apply-not-required"
              className="mt-5 border-t border-hairline-strong"
            >
              {notRequired.map((point) => (
                <div
                  key={point.title}
                  className="border-b border-hairline py-5 md:py-6"
                >
                  <dt className="text-heading-lg text-fg-muted">
                    {point.title}
                  </dt>
                  <dd className="mt-2 text-small text-fg-subtle">
                    {point.text}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="mt-16 md:mt-24">
          <h3
            id="apply-values"
            className="text-small font-medium text-fg-muted"
          >
            {copy.valuesTitle}
          </h3>
          <dl
            aria-labelledby="apply-values"
            className="mt-5 grid gap-x-10 gap-y-8 border-t border-hairline-strong pt-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((value) => (
              <div key={value.title}>
                <dt className="text-heading-sm text-fg">{value.title}</dt>
                <dd className="mt-2 text-small text-fg-muted">{value.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal variant="fade" className="mt-16 md:mt-24">
          <Photo
            aspect="panorama"
            src={photo.src}
            unoptimized={isUnoptimizedRemoteImage(photo.src)}
            alt={photo.alt}
            position={photo.objectPosition}
            sizes={coverSizes(photo, PANORAMA_PHOTO_FRAMES)}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
