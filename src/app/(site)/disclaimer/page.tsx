import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { DisclaimerPage } from "@/features/legal/disclaimer-page";

export const metadata = buildMetadata("disclaimer");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("disclaimer")} />
      <DisclaimerPage />
    </>
  );
}
