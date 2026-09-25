import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { PrivacyPage } from "@/features/legal";

export const metadata = buildMetadata("data-privacy");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("data-privacy")} />
      <PrivacyPage />
    </>
  );
}
