import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { CommunityPage } from "@/features/community/community-page";

export const metadata = buildMetadata("community");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("community")} />
      <CommunityPage />
    </>
  );
}
