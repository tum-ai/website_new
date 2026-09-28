import type { CSSProperties } from "react";
import { ButtonLink, FallbackImage } from "@/components/ds";
import type { Partner } from "@/lib/types";
import { symbolOnlyLogos } from "./data/partner-logos";
import { marqueeLogos } from "./data/partner-marquee-logos";
import { getPartnerKey } from "./partner-directory";

/** The partner name, set in place of (or beside) artwork on the dark hero. */
function PartnerName({ name }: { name: string }) {
  return (
    <span className="text-center font-bold text-heading-sm text-violet-50">
      {name}
    </span>
  );
}

/**
 * Highlighted-partner rail for the dark hero. Unlike the DS `Marquee` (which
 * duplicates its list), every partner is rendered once and moves at an equal
 * rate, wrapping outside the clipped window; mechanics live in partners.css.
 * Only artwork verified on dark bands is shown (`marqueeLogos`); everything
 * else, and artwork that fails to load, falls back to the name.
 */
export function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;
  const animated = partners.length > 3;
  return (
    <div
      className="partner-marquee border-hairline border-t pt-5 md:pt-6"
      data-animated={animated}
      style={
        {
          "--marquee-duration": `${partners.length * 5}s`,
          "--marquee-count": partners.length,
        } as CSSProperties
      }
    >
      <div className="mb-4 flex items-center justify-between gap-4 md:mb-6">
        <p className="font-semibold text-fg-muted text-meta">
          In good company.
        </p>
        <ButtonLink href="#our-partners" variant="link" size="sm" arrow="down">
          Meet our partners
        </ButtonLink>
      </div>
      <div className="partner-marquee-window motion-safe:mask-fade-x">
        <ul className="partner-marquee-set" aria-label="Highlighted partners">
          {partners.map((partner, index) => {
            const key = getPartnerKey(partner.name);
            const image = marqueeLogos[key];
            const lockup = image ? symbolOnlyLogos.has(image) : false;
            return (
              <li
                key={key}
                className="partner-marquee-item opacity-80 transition-opacity duration-300 ease-brand hover:opacity-100"
                style={{ "--marquee-index": index } as CSSProperties}
              >
                {lockup ? (
                  <span className="flex items-center gap-2.5 font-semibold text-label text-violet-50">
                    <FallbackImage
                      src={image}
                      alt=""
                      width={72}
                      height={72}
                      loading="eager"
                      className="size-9 object-contain"
                      fallback={null}
                    />
                    {partner.name}
                  </span>
                ) : (
                  <FallbackImage
                    src={image}
                    alt={partner.name}
                    width={200}
                    height={80}
                    loading="eager"
                    className="block h-full max-h-8 w-full object-contain md:max-h-10"
                    fallback={<PartnerName name={partner.name} />}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
