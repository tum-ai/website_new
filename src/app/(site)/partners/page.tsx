import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { getSanityPartners } from "@/lib/sanity";
import Partners from "@/views/headerPages/Partners";

export const metadata = buildMetadata("partners");
export const revalidate = 900;

export default async function Page() {
  const partners = await getSanityPartners();

  return (
    <>
      <JsonLd data={getJsonLd("partners")} />
      <Partners initialPartners={partners} />
    </>
  );
}
