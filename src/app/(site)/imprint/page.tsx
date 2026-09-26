import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ImprintPage } from "@/features/legal/imprint-page";

export const metadata = buildMetadata("imprint");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("imprint")} />
      <ImprintPage />
    </>
  );
}
