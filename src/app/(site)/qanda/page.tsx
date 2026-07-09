import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import QandA from "@/views/headerPages/QandA";

export const metadata = buildMetadata("qanda");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("qanda")} />
      <QandA />
    </>
  );
}
