import { useEffect, useState } from "react";
import ResearchCard from "@/components/research/ResearchCard";
import { ContentPage } from "@/pages/headerPages/ContentPage";
import { project_partners } from "@/data/partners";
import type { Research } from "@/lib/types";

export default function Research() {
  const [projects, setProjects] = useState<Research[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Research[]>([]);
  const [pastProjects, setPastProjects] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/getResearch");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError("Could not load research projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      setOngoingProjects(projects.filter((p) => p.status === "ongoing"));
      setPastProjects(projects.filter((p) => p.status === "completed"));
    }
  }, [projects]);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const tabs = [
    {
      value: "projects",
      label: "Projects",
      content: (
        <>
          {/* Ongoing projects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {ongoingProjects.map((p) => (
              <ResearchCard
                key={p.title}
                title={p.title}
                description={p.description}
                image={p.image}
                publication={p.publication}
                keywords={p.keywords} // Keywords under title
              />
            ))}
          </div>

          {/* Past projects */}
          {pastProjects.length > 0 && (
            <>
              <h3 className="text-3xl font-semibold text-center mt-12 mb-6">
                Past Projects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {pastProjects.map((p) => (
                  <ResearchCard
                    key={p.title}
                    title={p.title}
                    description={p.description}
                    image={p.image}
                    publication={p.publication}
                    keywords={p.keywords} // Keywords under title
                  />
                ))}
              </div>
            </>
          )}
        </>
      ),
    },
    {
      value: "exchange",
      label: "Research Exchange (REX) Program",
      content: (
          <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-purple-300">
            Research Exchange (REX) Program
          </h2>

          <p className="text-lg leading-relaxed">
            Our Research Exchange (REX) Program provides TUM.ai members with
            opportunities to conduct research abroad. Offers range from final
            theses to research internships with leading labs at institutions like
            <span className="font-semibold"> Harvard, MIT, Cambridge,</span> or{" "}
            <span className="font-semibold">INRIA</span>.
          </p>

          <p className="text-lg leading-relaxed">
            We collect project proposals from our partners, inform members about
            the requirements and usual processes, preselect applicants based on
            prior relevant (research) experience, recommend them to our partner
            labs, and eventually support their journey abroad with alumni
            experience in visa processes, housing, etc.
          </p>

          <p className="text-lg leading-relaxed">
            REX was launched based on the observation that members were already
            conducting research abroad and recommending others to follow in their
            footsteps. It is therefore a testament to our tight-knit community
            that we could build a network of great researchers who eagerly
            introduce our members to their respective fields and trust TUM.ai to
            provide curious minds.
          </p>
        
        </div>
      ),
    },
  ];

  return (
    <ContentPage
      title="Research"
      description="Our research offerings - from projects to exchange programs..."
      tabs={tabs}
      collaborators={{ logos: project_partners }}
    />
  );
}
