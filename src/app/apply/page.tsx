import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import Apply from "@/views/apply/Apply";

export const metadata = buildMetadata("apply");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("apply")} />
      <Apply />
    </>
  );
}
