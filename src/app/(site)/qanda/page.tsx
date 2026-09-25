import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { QandAPage } from "@/features/qanda";

export const metadata = buildMetadata("qanda");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("qanda")} />
      <QandAPage />
    </>
  );
}
