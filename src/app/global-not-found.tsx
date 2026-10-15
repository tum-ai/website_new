import NextNotFound from "next/dist/client/components/builtin/not-found";
import SiteLayout from "./(site)/layout";

export { metadata, viewport } from "./(site)/layout";

/**
 * 404 page for URLs that match no route.
 *
 * The site and `/studio` are separate root layouts, so there is no shared
 * layout for Next.js to render a 404 in. This renders the site layout around
 * Next.js' built-in 404 UI, which is exactly what the single root layout
 * rendered before the split. Replace `NextNotFound` to brand the page.
 */
export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <NextNotFound />
    </SiteLayout>
  );
}
