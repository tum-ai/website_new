import Image from "next/image";
import { ButtonLink, PageHero, SplitWords } from "@/components/ds";
import type { Partner } from "@/lib/types";
import { HeroContact } from "../contact-actions";
import { getHighlightedPartners } from "../partner-directory";
import { PartnerMarquee } from "../partner-marquee";

/* Large hero buttons step down to the md size on phones so both fit one row. */
const heroActionSize = "max-sm:h-11 max-sm:px-5 max-sm:text-label";

/** Opening band: the pitch and contact actions beside a photo, then the partner rail. */
export function PartnersHero({ partners }: { partners: Partner[] }) {
  return (
    <PageHero
      titleId="partner-hero-title"
      eyebrow="The next generation doesn’t wait."
      splitTitle={false}
      title={
        <>
          <SplitWords delay={80}>Meet the</SplitWords>
          <br />
          <SplitWords delay={220}>cracked &amp;</SplitWords>
          <br />
          <SplitWords delay={360}>the curious</SplitWords>
        </>
      }
      lead="Germany’s largest AI student initiative. Partner with the people building Europe’s next AI companies."
      actions={
        <>
          <HeroContact className={heroActionSize} />
          <ButtonLink
            href="#find-your-fit"
            variant="outline"
            size="lg"
            arrow="down"
            className={heroActionSize}
          >
            Find your fit
          </ButtonLink>
        </>
      }
      media={
        <figure className="group/zoom relative isolate min-h-72 overflow-hidden rounded-signature bg-sunken md:min-h-108 lg:min-h-120">
          <Image
            src="/assets/partners/hero.webp"
            alt="A speaker presenting to a packed auditorium at a TUM.ai event"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="zoom-media object-cover object-[center_40%] md:object-[57%_center]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-40% from-transparent to-ink-950/85"
          />
          <figcaption className="absolute inset-x-6 bottom-6 z-1 flex items-end justify-between gap-3 font-medium text-body text-white md:inset-x-7 md:bottom-7 lg:text-lead">
            <span>
              Ideas become companies.
              <br />
              People make it happen.
            </span>
            <span className="hidden text-meta text-white/75 lg:inline">
              TUM.ai
            </span>
          </figcaption>
        </figure>
      }
      classNames={{ lead: "max-w-md" }}
    >
      <PartnerMarquee partners={getHighlightedPartners(partners)} />
    </PageHero>
  );
}
