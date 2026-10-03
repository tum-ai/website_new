import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { getQandaMainEntity, QandAPage } from "@/features/qanda/qanda-page";

export const metadata = buildMetadata("qanda");

export default async function Page() {
  return (
    <>
      <JsonLd
        data={getJsonLd("qanda", { mainEntity: await getQandaMainEntity() })}
      />
      <QandAPage />
    </>
  );
}
