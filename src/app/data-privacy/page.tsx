import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import DataPrivacy from "@/views/footer/Privacy";

export const metadata = buildMetadata("data-privacy");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("data-privacy")} />
      <DataPrivacy />
    </>
  );
}
