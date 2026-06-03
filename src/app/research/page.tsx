import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { getSanityPartners, getSanityResearchProjects } from "@/lib/sanity";
import Research from "@/views/headerPages/Research";

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
      <Research
        initialProjects={projects}
        researchPartners={researchPartners}
      />
    </>
  );
}