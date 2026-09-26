import { Highlight, PageHero } from "@/components/ds";
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
      <img
        src={eLabConfig.heroLogo.src}
        alt={eLabConfig.heroLogo.alt}
        width={287}
        height={56}
        fetchPriority="high"
        className="-ml-[1.17rem] h-10 w-auto md:-ml-[1.64rem] md:h-14"
      />
      <span className="flex items-center gap-3 pb-0.5 md:pb-1">
        <span className="text-fg-subtle">by</span>
        <img
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

const promises = ["Equity-free", "Munich-based", "Founder-focused"];

/**
 * "Equity-free • Munich-based • Founder-focused". Each item carries its
 * leading bullet in the gap; the row is shifted left under a clip, so the
 * bullet of whichever item starts a line is hidden and wrapped lines never
 * begin or end with a dangling "•".
 */
function Promises() {
  return (
    <p className="overflow-hidden">
      <span className="-ml-7 flex flex-wrap gap-y-1 font-medium text-fg">
        {promises.map((promise, index) => (
          <span key={promise} className="relative pl-7">
            <span
              aria-hidden
              className="absolute left-0 w-7 text-center text-highlight"
            >
              {index > 0 ? "•" : ""}
            </span>
            {promise}
            {index < promises.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </p>
  );
}

export const Hero = () => {
  return (
    <PageHero
      titleId={HERO_TITLE_ID}
      eyebrow={<LogoLockup />}
      title={[
        "Build the next generation of ",
        <Highlight key="highlight">AI startups</Highlight>,
        ` in ${eLabConfig.programWeeks} weeks`,
      ]}
      lead={<Promises />}
      actions={
        <>
          <ELabApplicationCta label="hero" />
          <ELabApplicationStatus />
        </>
      }
    />
  );
};
