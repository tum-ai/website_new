import { ArrowDown } from "lucide-react";
import type { CSSProperties } from "react";
import { marqueeLogos } from "@/data/partner-marquee-logos";
import { getPartnerKey } from "@/lib/partner-directory";
import type { Partner } from "@/lib/types";
import PartnerLogo from "./PartnerLogo";

export default function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;
  const animated = partners.length > 3;
  return (
    <div
      className="partner-container partner-marquee"
      data-animated={animated}
      style={
        {
          "--marquee-duration": `${partners.length * 5}s`,
          "--marquee-count": partners.length,
        } as CSSProperties
      }
    >
      <div className="partner-marquee-heading">
        <p>In good company.</p>
        <a href="#our-partners">
          Meet our partners <ArrowDown size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="partner-marquee-window">
        <ul className="partner-marquee-set" aria-label="Highlighted partners">
          {partners.map((partner, index) => {
            const key = getPartnerKey(partner.name);
            const image = marqueeLogos[key];
            return (
              <li
                key={key}
                className="partner-marquee-item"
                style={{ "--marquee-index": index } as CSSProperties}
              >
                {key === "mutagent" && image ? (
                  <span className="partner-logo-lockup">
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
