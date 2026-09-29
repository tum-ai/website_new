import Image from "next/image";
import type { ReactNode } from "react";
import { PageHero } from "@/components/ds";
import type { ContentImage } from "@/lib/cms-content-model";
import { ELabApplicationCta, ELabApplicationStatus } from "./application-cta";
import type { ELabCopy } from "./data/copy";

const HERO_TITLE_ID = "elab-hero-title";

/**
 * Cohort logo "by" TUM.ai (both white artwork, made for the ink hero). The
 * cohort SVG's viewBox starts 248 units left of the letterforms, so a negative
 * margin (0.468 × its height) aligns the "E" with the headline below.
 */
function LogoLockup({ logo }: { logo: ContentImage }) {
  return (
    <span className="flex flex-wrap items-end gap-x-4 gap-y-3 pb-3 md:pb-5">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={287}
        height={56}
        preload
        className="-ml-[1.17rem] h-10 w-auto md:-ml-[1.64rem] md:h-14"
      />
      <span className="flex items-center gap-3 pb-0.5 md:pb-1">
        <span className="text-fg-subtle">by</span>
        <Image
          src="/assets/tum_ai_logo_new.svg"
          alt="TUM.ai"
          width={100}
          height={25}
          className="h-5 w-auto md:h-6"
        />
      </span>
    </span>
  );
}

/**
 * E-Lab hero: the cohort lockup, the program in one sentence, the terms in
 * the lead and the live application action, beside the field of a round's
 * applications thinning to the teams that reach the Final Pitch (the page's
 * idea, which the gates band then draws to scale). `logo` is the cohort's
 * artwork (`facts.eLab.heroLogo`); `field` the dot field (ApplicationField).
 */
export function Hero({
  copy,
  logo,
  field,
}: {
  copy: ELabCopy["hero"];
  logo: ContentImage;
  field: ReactNode;
}) {
  return (
    <PageHero
      titleId={HERO_TITLE_ID}
      eyebrow={<LogoLockup logo={logo} />}
      title={copy.title}
      emphasis="highlight"
      size="md"
      mark={false}
      lead={copy.lead}
      actions={
        <>
          <ELabApplicationCta />
          <ELabApplicationStatus />
        </>
      }
      media={field}
    />
  );
}
