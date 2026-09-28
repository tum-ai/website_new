import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ApplyPage } from "@/features/apply/apply-page";
import { getCmsNow } from "@/lib/mock-cms-env";

export const metadata = buildMetadata("apply");

/** Daily, so the initiative's age in the copy turns over without a deploy. */
export const revalidate = 86400;

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("apply")} />
      <ApplyPage now={getCmsNow()} />
    </>
  );
}
