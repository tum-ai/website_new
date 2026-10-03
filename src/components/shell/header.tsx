"use client";

import { Header as KitHeader } from "@tum.ai/ui-kit/shell";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  getHeaderOptions,
  type HeaderCtaSchedule,
  headerCtaAt,
  headerCtaBoundaries,
  mainNavigation,
  type NavLink,
} from "@/config/navigation";
import { useClockState } from "@/lib/use-clock-switch";

/** Props for {@link Header}, computed by the site layout on the server. */
export type HeaderProps = {
  /**
   * What the site-wide CTA depends on (the membership window, the fallback,
   * the campaigns), resolved for the render: `headerCtaSchedule(...)`.
   */
  ctaSchedule: HeaderCtaSchedule;
  /**
   * The site-wide CTA at render time (`headerCtaAt(ctaSchedule,
   * getCmsNow())`); must match the server HTML.
   */
  initialCta: NavLink | null;
  /** The menu's "Connect" row (`headerConnectLinksFor(await getSiteFacts())`). */
  connectLinks: readonly NavLink[];
  /** `false` on a fixed render clock (`MOCK_CMS_NOW`); see `useClockState`. */
  liveClock?: boolean;
};

/**
 * Website adapter for the kit header. The layout supplies the server CTA and
 * schedule; this adapter keeps it current and applies pathname overrides.
 */
export const Header = ({
  ctaSchedule,
  initialCta,
  connectLinks,
  liveClock = true,
}: HeaderProps) => {
  const pathname = usePathname();
  // The CTA follows the dated schedule: the layout renders it by the
  // server's clock, and the browser re-evaluates it when the membership form
  // opens, at the deadline, and when a campaign starts or ends.
  const ctaAt = useCallback(
    (now: Date) => headerCtaAt(ctaSchedule, now),
    [ctaSchedule],
  );
  const boundaries = useMemo(
    () => headerCtaBoundaries(ctaSchedule),
    [ctaSchedule],
  );
  const siteCta = useClockState({
    at: ctaAt,
    boundaries,
    initial: initialCta,
    live: liveClock,
  });
  const { solid, cta } = getHeaderOptions(pathname, { cta: siteCta });
  return (
    <KitHeader
      navigation={mainNavigation}
      logo={{
        src: "/assets/tum_ai_logo_new.svg",
        width: 1640,
        height: 406,
        alt: "",
      }}
      homeLabel="TUM.ai home"
      solid={solid}
      cta={cta}
      connectLinks={connectLinks}
    />
  );
};
