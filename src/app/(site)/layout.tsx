import { MotionProvider } from "@tum.ai/ui-kit";
import { SkipLink } from "@tum.ai/ui-kit/shell";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Footer } from "@/components/shell/footer";
import { Header } from "@/components/shell/header";
import { RouteImagePreload } from "@/components/shell/route-image-preload";
import { eLabCohortNameOf } from "@/config/e-lab";
import {
  headerConnectLinksFor,
  headerCtaAt,
  headerCtaSchedule,
} from "@/config/navigation";
import { getCampaigns, getMembershipWindow } from "@/config/schedule-content";
import { rootMetadata } from "@/config/seo";
import { getSiteFacts } from "@/config/site-settings-content";
import { getCmsNow, isCmsClockFixed } from "@/lib/mock-cms-env";
import { isSanityConfigured, SanityLive } from "@/lib/sanity";
import "@/styles/index.css";

const manrope = localFont({
  src: "../../../public/assets/Manrope.ttf",
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  ...rootMetadata,
  icons: {
    icon: [
      {
        url: "/assets/favicon-96.png",
        type: "image/png",
        sizes: "96x96",
      },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: {
      url: "/assets/favicon-96.png",
      type: "image/png",
      sizes: "96x96",
    },
    apple: {
      url: "/assets/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180",
    },
  },
};

/**
 * Every site route renders again at least hourly (routes with a shorter
 * `revalidate` keep theirs). A safety net: the Sanity webhook
 * (`/api/revalidate`) regenerates pages on publish, but a missed delivery
 * would otherwise leave a formerly static route (`/`, `/community`,
 * `/projects`, `/qanda`, the legal pages) on its old content until the next
 * deploy. It also bounds how long a page's server-rendered phase (header
 * CTA, apply buttons) and baked schedule lag the clock: the browser
 * islands switch at the instants they were rendered with, so an edited
 * deadline reaches them only when the page regenerates. Pages stay
 * prerendered at build (the homepage budget reads that output), and an
 * hourly render per route is cheap next to the 5 to 15 minute ISR routes.
 */
export const revalidate = 3600;

/**
 * Browser chrome that still reads theme-color (e.g. Chrome on Android) uses the
 * same brand black as the root canvas, the hero tops and the footer
 * (`--color-black` in src/styles/index.css; metadata needs a literal color).
 */
export const viewport: Viewport = {
  themeColor: "#0d0214",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();
  const [facts, membership, campaigns] = await Promise.all([
    getSiteFacts(),
    getMembershipWindow(),
    getCampaigns(),
  ]);
  // The header's CTA follows the membership window and the campaigns: the
  // schedule goes to the browser, which re-evaluates it at each boundary.
  const ctaSchedule = headerCtaSchedule({
    membership,
    fallback: facts.headerCtaFallback,
    eLabCohortName: eLabCohortNameOf(facts.eLab.currentIteration),
    campaigns,
  });

  return (
    <html lang="en" className={manrope.variable}>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body>. */}
      <body suppressHydrationWarning>
        <SkipLink />
        {/* Isolated root so Base UI portals always stack above page content. */}
        <div id="app-root" className="isolate">
          <MotionProvider>
            <Header
              ctaSchedule={ctaSchedule}
              initialCta={headerCtaAt(ctaSchedule, getCmsNow())}
              connectLinks={headerConnectLinksFor(facts)}
              liveClock={!isCmsClockFixed()}
            />
            <div
              id="main-content"
              tabIndex={-1}
              className="min-h-screen bg-white outline-none"
            >
              {children}
            </div>
            <Footer />
          </MotionProvider>
        </div>
        {/* Warms the /events hero's co-host logos, so its load roll starts
            at once. Only the reel shows them, and only with motion allowed. */}
        <RouteImagePreload
          route="/events"
          imagesUrl="/events/hero-images"
          media="(prefers-reduced-motion: no-preference)"
        />
        {isSanityConfigured ? <SanityLive includeDrafts={isDraftMode} /> : null}
        {isDraftMode ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
