import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ApplyPage } from "@/features/apply/apply-page";
import { getMockCmsNow } from "@/lib/mock-cms-env";

export const metadata = buildMetadata("apply");

/** Daily, so the initiative's age in the copy turns over without a deploy. */
export const revalidate = 86400;

/**
 * The render time, or `MOCK_CMS_NOW` under the mock CMS (the same condition
 * as in `lib/sanity.ts` and the /events route), so end-to-end and visual runs
 * render the same date-derived copy.
 */
function getRenderNow(): Date {
  return process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL
    ? getMockCmsNow(process.env)
    : new Date();
}

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("apply")} />
      <ApplyPage now={getRenderNow()} />
    </>
  );
}
