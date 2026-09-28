import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ResearchPage } from "@/features/research/research-page";
import {
  getSanityResearchPartners,
  getSanityResearchProjects,
} from "@/lib/sanity";

export const metadata = buildMetadata("research");
export const revalidate = 900;

export default async function Page() {
  const [projects, researchPartners] = await Promise.all([
    getSanityResearchProjects(),
    getSanityResearchPartners(),
  ]);

  return (
    <>
      <JsonLd data={getJsonLd("research")} />
      <ResearchPage projects={projects} researchPartners={researchPartners} />
    </>
  );
}
