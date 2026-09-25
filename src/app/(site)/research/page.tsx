import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ResearchPage } from "@/features/research";
import { getSanityPartners, getSanityResearchProjects } from "@/lib/sanity";

export const metadata = buildMetadata("research");
export const revalidate = 900;

export default async function Page() {
  const [projects, allPartners] = await Promise.all([
    getSanityResearchProjects(),
    getSanityPartners(),
  ]);

  const researchPartners = allPartners.filter(
    (partner) => partner.category === "Research Partners",
  );

  return (
    <>
      <JsonLd data={getJsonLd("research")} />
      <ResearchPage
        initialProjects={projects}
        researchPartners={researchPartners}
      />
    </>
  );
}
