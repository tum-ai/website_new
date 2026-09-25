import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ApplyPage } from "@/features/apply";

export const metadata = buildMetadata("apply");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("apply")} />
      <ApplyPage />
    </>
  );
}
