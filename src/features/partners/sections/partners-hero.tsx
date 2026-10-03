import { ButtonLink, PageHero, SplitWords } from "@tum.ai/ui-kit";
import Image from "next/image";
import { Fragment } from "react";
import type { Partner } from "@/lib/types";
import { HeroContact } from "../contact-actions";
import type { PartnersSections } from "../data/partners";
import type { PartnerLogos } from "../organization-content";
import { getHighlightedPartners } from "../partner-directory";
import { PartnerMarquee } from "../partner-marquee";
import { Lines } from "./lines";

/* Large hero buttons step down to the md size on phones so both fit one row. */
const heroActionSize = "max-sm:h-11 max-sm:px-5 max-sm:text-label";

/** The hero title's lines animate in one after another. */
const TITLE_DELAY = 80;
const TITLE_STEP = 140;

/** Opening band: the pitch and contact actions beside a photo, then the partner rail. */
export function PartnersHero({
  partners,
  logos,
  copy,
  marquee,
}: {
  partners: Partner[];
  /** The dark-band artwork and symbol-only files for the rail. */
  logos: Pick<PartnerLogos, "marqueeLogos" | "symbolOnlyLogos">;
  copy: PartnersSections["hero"];
  marquee: PartnersSections["marquee"];
}) {
  return (
    <PageHero
      titleId="partner-hero-title"
      eyebrow={copy.eyebrow}
      splitTitle={false}
      title={copy.title.map((line, index) => (
        <Fragment key={line}>
          {index > 0 ? <br /> : null}
          <SplitWords delay={TITLE_DELAY + index * TITLE_STEP}>
            {line}
          </SplitWords>
        </Fragment>
      ))}
      lead={copy.lead}
      actions={
        <>
          <HeroContact label={copy.contactLabel} className={heroActionSize} />
          <ButtonLink
            href="#find-your-fit"
            variant="outline"
            size="lg"
            arrow="down"
            className={heroActionSize}
          >
            {copy.fitLabel}
          </ButtonLink>
        </>
      }
      media={
        <figure className="group/zoom relative isolate min-h-72 overflow-hidden rounded-4xl bg-sunken md:min-h-108 lg:min-h-120">
          <Image
            src="/assets/partners/hero.webp"
            alt="A speaker presenting to a packed auditorium at a TUM.ai event"
            fill
            preload
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="zoom-media object-cover object-[center_40%] md:object-[57%_center]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-40% from-transparent to-ink-950/85"
          />
          <figcaption className="absolute inset-x-6 bottom-6 z-1 font-medium text-body text-white md:inset-x-7 md:bottom-7 lg:text-lead">
            <Lines lines={copy.caption} />
          </figcaption>
        </figure>
      }
      classNames={{ lead: "max-w-md" }}
    >
      <PartnerMarquee
        partners={getHighlightedPartners(partners)}
        marqueeLogos={logos.marqueeLogos}
        symbolOnlyLogos={logos.symbolOnlyLogos}
        copy={marquee}
      />
    </PageHero>
  );
}
