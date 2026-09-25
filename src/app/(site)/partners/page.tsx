import { unstable_rethrow } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { PartnersPage } from "@/features/partners";
import { getSanityPartners } from "@/lib/sanity";

export const metadata = buildMetadata("partners");
export const revalidate = 900;

export default async function Page() {
  const partners = await getSanityPartners().catch((error: unknown) => {
    unstable_rethrow(error);
    console.error(
      "Partner directory unavailable; showing curated launch partners.",
    );
    return [];
  });

  return (
    <>
      <JsonLd data={getJsonLd("partners")} />
      <PartnersPage initialPartners={partners} />
    </>
  );
}
