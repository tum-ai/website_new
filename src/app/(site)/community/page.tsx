import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { CommunityPage } from "@/features/community";

export const metadata = buildMetadata("community");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("community")} />
      <CommunityPage />
    </>
  );
}
