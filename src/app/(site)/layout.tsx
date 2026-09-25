import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { MotionProvider } from "@/components/ds/motion-provider";
import { Footer } from "@/components/shell/footer";
import { Header } from "@/components/shell/header";
import { SkipLink } from "@/components/shell/skip-link";
import { isSanityConfigured, SanityLive } from "@/lib/sanity";
import "@/styles/index.css";

const manrope = localFont({
  src: "../../../public/assets/Manrope.ttf",
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tum-ai.com"),
  title: {
    default: "TUM.ai - Germany's Leading AI Student Initiative",
    template: "%s | TUM.ai",
  },
  description:
    "TUM.ai is Germany's leading AI student initiative, connecting students, research, and industry.",
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
 * Browser chrome that still reads theme-color (e.g. Chrome on Android) uses the
 * same brand black as the root canvas, the hero tops and the footer.
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

  return (
    <html lang="en" className={manrope.variable}>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body>. */}
      <body suppressHydrationWarning>
        <SkipLink />
        {/* Isolated root so Base UI portals always stack above page content. */}
        <div id="app-root" className="isolate">
          <MotionProvider>
            <Header />
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
        {isSanityConfigured ? <SanityLive includeDrafts={isDraftMode} /> : null}
        {isDraftMode ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
