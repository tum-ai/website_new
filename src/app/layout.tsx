import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { MotionProvider } from "@/components/ds/motion-provider";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { isSanityConfigured, SanityLive } from "@/lib/sanity";
import "../styles/index.css";

const manrope = localFont({
  src: "../../public/assets/Manrope.ttf",
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
 * Browser chrome (mobile status bar, Safari tab bar) matches the dark hero
 * every page opens with, instead of falling back to white.
 */
export const viewport: Viewport = {
  themeColor: "#1b0049",
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
        <a
          href="#main-content"
          className="absolute top-3 left-3 z-[100] -translate-y-[200%] rounded-full bg-white px-5 py-3 text-small font-semibold text-violet-950 shadow-lift transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        {/* Isolated root so Base UI portals always stack above page content. */}
        <div className="isolate">
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
