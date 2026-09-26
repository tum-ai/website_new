import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { PartnersPage } from "@/features/partners/partners-page";
// Page CSS loads from the route: a CSS import inside a feature would keep
// that module in every page that imports the feature (the homepage imports
// the partners index for the partner directory).
import "@/features/partners/partners.css";
import { getSanityPartners } from "@/lib/sanity";

export const metadata = buildMetadata("partners");
export const revalidate = 900;

export default async function Page() {
  // Empty when the CMS is unavailable; the page then shows its curated
  // launch partners.
  const partners = await getSanityPartners();

  return (
    <>
      <JsonLd data={getJsonLd("partners")} />
      <PartnersPage initialPartners={partners} />
    </>
  );
}
