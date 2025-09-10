import Layout from "@/components/Layout";
import Logos from "@/components/Logos";
import ResearchCard from "@/components/research/ResearchCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { researchPartners } from "@/data/partners";
import type { Research } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import type React from "react";

export default function Research() {
  const [projects, setProjects] = useState<Research[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Research[]>([]);
  const [pastProjects, setPastProjects] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("projects");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/getResearch`,
        );
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

  if (loading) return <LoadingScreen text="Loading research projects..." />;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const tabs = [
    {
      value: "projects",
      label: "Projects",
      content: (
        <div>
          {/* Ongoing projects */}
          <div className="flex flex-wrap justify-center md:justify-start mx-[-0.75rem]">
            {ongoingProjects.map((p) => (
              <div className="flex-shrink-0 px-3 pb-6">
                <ResearchCard
                  key={p.title}
                  title={p.title}
                  description={p.description}
                  image={p.image}
                  publication={p.publication}
                  keywords={p.keywords} // Keywords under title
                />
              </div>
            ))}
          </div>

          {/* Past projects */}
          {pastProjects.length > 0 && (
            <>
              <h3 className="text-3xl font-semibold text-center mt-12 mb-4 text-white">
                Past Projects
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start mx-[-0.75rem]">
                {pastProjects.map((p) => (
                  <div className="flex-shrink-0 px-3 pb-6">
                    <ResearchCard
                      key={p.title}
                      title={p.title}
                      description={p.description}
                      image={p.image}
                      publication={p.publication}
                      keywords={p.keywords} // Keywords under title
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      value: "exchange",
      label: "Research Exchange Program",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-center text-white">
            Research Exchange (REX) Program
          </h2>

          <p className="text-lg leading-relaxed text-gray-200">
            Our Research Exchange (REX) Program provides TUM.ai members with
            opportunities to conduct research abroad. Offers range from final
            theses to research internships with leading labs at institutions
            like
            <span className="font-semibold text-white">
              {" "}
              Harvard, MIT, Cambridge,
            </span>{" "}
            or <span className="font-semibold text-white">INRIA</span>.
          </p>

          <p className="text-lg leading-relaxed text-gray-200">
            We collect project proposals from our partners, inform members about
            the requirements and usual processes, preselect applicants based on
            prior relevant (research) experience, recommend them to our partner
            labs, and eventually support their journey abroad with alumni
            experience in visa processes, housing, etc.
          </p>

          <p className="text-lg leading-relaxed text-gray-200">
            REX was launched based on the observation that members were already
            conducting research abroad and recommending others to follow in
            their footsteps. It is therefore a testament to our tight-knit
            community that we could build a network of great researchers who
            eagerly introduce our members to their respective fields and trust
            TUM.ai to provide curious minds.
          </p>
        </div>
      ),
    },
  ];

  const focusTabAt = (index: number) => {
    const clamped = (index + tabs.length) % tabs.length;
    tabRefs.current[clamped]?.focus();
    setActiveTab(tabs[clamped].value);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTabAt(index + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusTabAt(index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTabAt(0);
        break;
      case "End":
        e.preventDefault();
        focusTabAt(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <section className="relative pt-32 pb-16 px-8 bg-gradient-to-br from-blue-900 to-purple-900">
      <Layout>
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col justify-center">
          <div className="flex flex-col items-center gap-4 mb-4 px-6 text-center">
            <h1 className="text-4xl font-bold md:text-5xl text-white">
              Research
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-200">
              Our research offerings - from projects to exchange programs
            </p>
          </div>

          {/* Tabs Section */}
          {tabs.length > 1 ? (
            <div className="w-full px-6 md:px-12">
              <div
                role="tablist"
                aria-label="Research tabs"
                className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4"
              >
                {tabs.map((tab, idx) => {
                  const selected = activeTab === tab.value;
                  return (
                    <Button
                      key={tab.value}
                      ref={(el) => {
                        tabRefs.current[idx] = el;
                      }}
                      role="tab"
                      id={`tab-${tab.value}`}
                      aria-selected={selected}
                      aria-controls={`panel-${tab.value}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActiveTab(tab.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className={
                        "w-full sm:w-auto text-center rounded-md text-sm transition-colors " +
                        (!selected
                          ? "bg-white/10 text-white shadow-inner ring-1 ring-white/20"
                          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white")
                      }
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              {tabs.map((tab) => (
                <div
                  key={tab.value}
                  role="tabpanel"
                  id={`panel-${tab.value}`}
                  aria-labelledby={`tab-${tab.value}`}
                  hidden={activeTab !== tab.value}
                  className="w-full pt-4"
                >
                  {tab.content}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full px-6 sm:px-8 lg:px-12">
              {tabs[0].content}
            </div>
          )}

          {Array.isArray(researchPartners) && researchPartners.length > 0 && (
            <div className="px-6 md:px-12 mt-12">
              <h3 className="mb-4 text-center text-3xl font-semibold text-white">
                Collaborators
              </h3>

              <Card>
                <CardContent className="px-0">
                  <Logos logos={researchPartners} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Layout>
    </section>
  );
}
