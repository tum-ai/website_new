import { PageHero } from "@tum.ai/ui-kit";
import Image from "next/image";
import type { ReactNode } from "react";
import type { ContentImage } from "@/lib/cms-content-model";
import { ELabApplicationCta, ELabApplicationStatus } from "./application-cta";
import type { ELabCopy } from "./data/copy";

const HERO_TITLE_ID = "elab-hero-title";

/**
 * Program logo "by" TUM.ai (both white artwork, made for the ink hero). The
 * ELAB wordmark's viewBox is tight to its letterforms, so it lines up with
 * the headline below as it is; its width follows the file's aspect ratio.
 */
function LogoLockup({ logo }: { logo: ContentImage }) {
  return (
    <span className="flex flex-wrap items-end gap-x-4 gap-y-3 pb-3 md:pb-5">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        preload
        className="h-8 w-auto md:h-11"
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
 * ELAB hero: the program lockup, the program in one sentence, the terms in
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
