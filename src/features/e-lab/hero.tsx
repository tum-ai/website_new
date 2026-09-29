import Image from "next/image";
import { PageHero, Photo } from "@/components/ds";
import { eLabConfig } from "@/config/e-lab";
import { ELabApplicationCta, ELabApplicationStatus } from "./application-cta";

const HERO_TITLE_ID = "elab-hero-title";

/**
 * Cohort logo "by" TUM.ai (both white artwork, made for the ink hero). The
 * cohort SVG's viewBox starts 248 units left of the letterforms, so a negative
 * margin (0.468 × its height) aligns the "E" with the headline below.
 */
function LogoLockup() {
  return (
    <span className="flex flex-wrap items-end gap-x-4 gap-y-3 pb-3 md:pb-5">
      <Image
        src={eLabConfig.heroLogo.src}
        alt={eLabConfig.heroLogo.alt}
        width={287}
        height={56}
        priority
        className="-ml-[1.17rem] h-10 w-auto md:-ml-[1.64rem] md:h-14"
      />
      <span className="flex items-center gap-3 pb-0.5 md:pb-1">
        <span className="text-fg-subtle">by</span>
        <Image
          src="/assets/tum_ai_logo_new.svg"
          alt="TUM.ai Logo"
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
 * the lead, the live application action, and the kickoff hall as the room
 * the page is about.
 */
export function Hero() {
  return (
    <PageHero
      titleId={HERO_TITLE_ID}
      eyebrow={<LogoLockup />}
      title={`${eLabConfig.programWeeks} weeks from application to the Final Pitch.`}
      emphasis="highlight"
      size="md"
      mark={false}
      lead="The E-Lab is TUM.ai's equity-free AI startup incubator, in person in Munich. Apply alone or as a team, with or without an idea. You don't need to be enrolled anywhere."
      actions={
        <>
          <ELabApplicationCta />
          <ELabApplicationStatus />
        </>
      }
      media={
        <Photo
          src="/assets/homepage/elab.webp"
          alt="A speaker on stage at the AI E-Lab kickoff, in front of a packed brick hall"
          caption="AI E-Lab kickoff"
          position="50% 40%"
          aspect="4/3"
          eager
          sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 44vw, 92vw"
        />
      }
    />
  );
}
