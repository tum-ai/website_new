import type { Organization } from "@/lib/people-and-logos";
import { getPartnerKey } from "../partner-directory";
import { partnerLogoLists } from "./organizations";

/**
 * Dark-band artwork by partner key (`getPartnerKey` of the name). Only
 * artwork verified on the dark hero belongs in the list. Unknown or
 * unsuitable artwork falls back to the partner name, never a white tile or a
 * CSS recolor.
 */
export function marqueeLogosOf(
  list: readonly Organization[],
): Readonly<Record<string, string | undefined>> {
  return Object.fromEntries(
    list.flatMap(({ name, logoOnDark }) =>
      logoOnDark ? [[getPartnerKey(name), logoOnDark.src]] : [],
    ),
  );
}

export const marqueeLogos = marqueeLogosOf(partnerLogoLists["partner-marquee"]);
