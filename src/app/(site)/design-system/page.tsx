import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemPage } from "@/features/design-system/design-system-page";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Living reference for src/components/ds. Available in development and on
 * Vercel preview deployments only; production returns 404.
 */
export default function Page() {
  const enabled =
    process.env.NODE_ENV !== "production" ||
    process.env.VERCEL_ENV === "preview";
  if (!enabled) notFound();
  return <DesignSystemPage />;
}
