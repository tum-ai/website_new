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
      label: "REX Program",
      content: (
        <div className="text-white text-lg">
          {/* REX Program content */}
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
