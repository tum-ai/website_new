import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ApplyPage } from "@/features/apply/apply-page";
import { getCmsNow } from "@/lib/mock-cms-env";

export const metadata = buildMetadata("apply");

/**
 * Hourly, so the important dates, the days left and the open state follow
 * the clock without a deploy (the form itself closes at the deadline).
 */
export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("apply")} />
      <ApplyPage now={getCmsNow()} />
    </>
  );
}
