import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { CommunityPage } from "@/features/community/community-page";

export const metadata = buildMetadata("community");

export default async function Page() {
  return (
    <>
      <JsonLd data={await getJsonLd("community")} />
      <CommunityPage />
    </>
  );
}
