import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { isSanityConfigured, SanityLive } from "@/lib/sanity";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <>
      <Header />
      {children}
      <Footer />
      {isSanityConfigured ? <SanityLive includeDrafts={isDraftMode} /> : null}
      {isDraftMode ? <VisualEditing /> : null}
    </>
  );
}
