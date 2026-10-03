import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { PrivacyPage } from "@/features/legal/privacy-page";

export const metadata = buildMetadata("data-privacy");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("data-privacy")} />
      <PrivacyPage />
    </>
  );
}
