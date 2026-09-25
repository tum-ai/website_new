import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { DisclaimerPage } from "@/features/legal";

export const metadata = buildMetadata("disclaimer");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("disclaimer")} />
      <DisclaimerPage />
    </>
  );
}
