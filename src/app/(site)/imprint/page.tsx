import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ImprintPage } from "@/features/legal/imprint-page";

export const metadata = buildMetadata("imprint");

export default async function Page() {
  return (
    <>
      <JsonLd data={await getJsonLd("imprint")} />
      <ImprintPage />
    </>
  );
}
