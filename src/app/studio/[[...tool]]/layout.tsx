import type { ReactNode } from "react";

export { metadata, viewport } from "next-sanity/studio";

/**
 * Root layout of the embedded Sanity Studio.
 *
 * The Studio and the public site (`app/(site)/layout.tsx`) are separate root
 * layouts, so `/studio` loads none of the site CSS, header, footer, skip link
 * or motion provider. Moving between the two is a full page load.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Studio fills the viewport (`NextStudio` is 100vh); drop the UA margin. */}
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
