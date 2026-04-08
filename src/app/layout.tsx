import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TUM.ai - Germany's Leading AI Student Initiative",
    template: "%s | TUM.ai",
  },
  description:
    "TUM.ai is Germany's leading AI student initiative, connecting students, research, and industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
