import type { CSSProperties } from "react";
import { ButtonLink, LogoTile } from "@/components/ds";
import type { Partner } from "@/lib/types";
import { symbolOnlyLogos } from "./data/partner-logos";
import { marqueeLogos } from "./data/partner-marquee-logos";
import { getPartnerKey } from "./partner-directory";

/**
 * Highlighted-partner rail for the dark hero. Every partner is rendered once
 * (no duplicated list for a seamless loop) and moves at an equal rate,
 * wrapping outside the clipped window; mechanics live in partners.css. Under
 * reduced motion the rail stands still as a wrapped row of logos.
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
            return (
              <li
                key={key}
                className="partner-marquee-item opacity-80 transition-opacity duration-300 ease-brand hover:opacity-100"
                style={{ "--marquee-index": index } as CSSProperties}
              >
                <LogoTile
                  variant="bare"
                  eager
                  name={partner.name}
                  src={image}
                  wordmark={
                    image && symbolOnlyLogos.has(image)
                      ? partner.name
                      : undefined
                  }
                  className="size-full"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
