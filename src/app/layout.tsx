import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import type { Metadata } from "next";
import localFont from "next/font/local";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.variable}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
