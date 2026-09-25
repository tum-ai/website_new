import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ds";
import type { Partner } from "@/lib/types";
import { marqueeLogos } from "./data/partner-marquee-logos";
import { getPartnerKey } from "./partner-directory";
import { PartnerLogo } from "./partner-logo";

/**
 * Highlighted-partner rail for the dark hero. Unlike the DS `Marquee` (which
 * duplicates its list), every partner is rendered once and moves at an equal
 * rate, wrapping outside the clipped window; mechanics live in partners.css.
 */
export function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;
  const animated = partners.length > 3;
  return (
    <div
      className="partner-marquee mt-12 border-t border-hairline pt-5 motion-safe:animate-rise-sm [animation-delay:640ms] md:mt-14 md:pt-6"
      data-animated={animated}
      style={
        {
          "--marquee-duration": `${partners.length * 5}s`,
          "--marquee-count": partners.length,
        } as CSSProperties
      }
    >
      <div className="mb-4 flex items-center justify-between gap-4 md:mb-6">
        <p className="text-meta font-semibold text-fg-muted">
          In good company.
        </p>
        <ButtonLink href="#our-partners" variant="link" size="sm" arrow="down">
          Meet our partners
        </ButtonLink>
      </div>
      <div className="partner-marquee-window">
        <ul
          className="partner-marquee-set text-violet-50 [&_.partner-logo-fallback]:text-violet-50 [&_.partner-logo-image]:max-h-8 md:[&_.partner-logo-image]:max-h-10"
          aria-label="Highlighted partners"
        >
          {partners.map((partner, index) => {
            const key = getPartnerKey(partner.name);
            const image = marqueeLogos[key];
            return (
              <li
                key={key}
                className="partner-marquee-item opacity-80 transition-opacity duration-300 ease-brand hover:opacity-100"
                style={{ "--marquee-index": index } as CSSProperties}
              >
                {(key === "mutagent" || key === "dryft") && image ? (
                  <span className="partner-logo-lockup flex items-center gap-2.5 text-[0.9375rem] font-semibold [&_.partner-logo-image]:size-9">
                    <PartnerLogo name="" image={image} eager />
                    <span>{partner.name}</span>
                  </span>
                ) : (
                  <PartnerLogo name={partner.name} image={image} eager />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
