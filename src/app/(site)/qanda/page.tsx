import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { QandAPage, qandaMainEntity } from "@/features/qanda/qanda-page";

export const metadata = buildMetadata("qanda");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("qanda", { mainEntity: qandaMainEntity })} />
      <QandAPage />
    </>
  );
}
