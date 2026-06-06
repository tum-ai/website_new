import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { SanityLive, isSanityConfigured } from "@/lib/sanity";
import type { Metadata } from "next";
import { VisualEditing } from "next-sanity/visual-editing";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <html lang="en">
      <body className={manrope.variable}>
        <Header />
        {children}
        <Footer />
        {isSanityConfigured ? <SanityLive includeDrafts={isDraftMode} /> : null}
        {isDraftMode ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
