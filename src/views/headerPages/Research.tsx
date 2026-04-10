"use client";

import Layout from "@/components/Layout";
import Logos from "@/components/Logos";
import ResearchCard from "@/components/research/ResearchCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { researchPartners } from "@/data/partners";
import type { Research } from "@/lib/types";
import type React from "react";
import { useMemo, useRef, useState } from "react";

export default function Research({
  initialProjects = [],
}: {
  initialProjects?: Research[];
}) {
  const [activeTab, setActiveTab] = useState<string>("projects");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const ongoingProjects = useMemo(
    () => initialProjects.filter((project) => project.status === "ongoing"),
    [initialProjects],
  );
  const pastProjects = useMemo(
    () => initialProjects.filter((project) => project.status === "completed"),
    [initialProjects],
  );

  const tabs = [
    {
      value: "projects",
      label: "Projects",
      content: (
        <div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ongoingProjects.map((project) => (
              <ResearchCard
                key={project.title}
                title={project.title}
                description={project.description}
                image={project.image}
                publication={project.publication}
                keywords={project.keywords}
              />
            ))}
          </div>

          {pastProjects.length > 0 && (
            <>
              <h1 className="text-title sm:text-2xl mt-10 mb-4 text-white text-center md:text-[2rem] font-semibold animate-item">
                Past Projects
              </h1>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastProjects.map((project) => (
                  <ResearchCard
                    key={project.title}
                    title={project.title}
                    description={project.description}
                    image={project.image}
                    publication={project.publication}
                    keywords={project.keywords}
                  />
                ))}
              </div>
            </>
          )}

          {Array.isArray(researchPartners) && researchPartners.length > 0 && (
            <div className="mt-12">
              <h1 className="text-title sm:text-2xl mt-10 mb-4 text-white text-center md:text-[2rem] font-semibold animate-item">
                Collaborators
              </h1>

              <Card>
                <CardContent className="px-0 bg-minimal-gray">
                  <Logos logos={researchPartners} />
                </CardContent>
              </Card>
            </div>
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
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTabAt(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTabAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTabAt(0);
        break;
      case "End":
        event.preventDefault();
        focusTabAt(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <section className="relative pt-32 pb-16 px-8 bg-gradient-to-br from-black via-black to-[#291a39]">
      <Layout>
        <div className="min-h-screen">
          <div className="mb-4 flex flex-col items-center gap-4 px-6 text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Research
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-200">
              Our research offerings - from projects to exchange programs
            </p>
          </div>

          {tabs.length > 1 ? (
            <div className="w-full px-6 md:px-12">
              <div
                role="tablist"
                aria-label="Research tabs"
                className="mb-4 flex flex-col items-center justify-center gap-2 sm:flex-row"
              >
                {tabs.map((tab, index) => {
                  const selected = activeTab === tab.value;
                  return (
                    <Button
                      key={tab.value}
                      ref={(element) => {
                        tabRefs.current[index] = element;
                      }}
                      role="tab"
                      id={`tab-${tab.value}`}
                      aria-selected={selected}
                      aria-controls={`panel-${tab.value}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActiveTab(tab.value)}
                      onKeyDown={(event) => handleKeyDown(event, index)}
                      className={
                        "w-full rounded-md text-center text-sm transition-colors sm:w-auto " +
                        (selected
                          ? "bg-white/10 text-white shadow-inner ring-1 ring-white/20"
                          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white")
                      }
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
              {activeTab === "projects" && (
                <h1 className="text-title sm:text-2xl mt-10 text-white text-center md:text-[2rem] font-semibold animate-item">
                  Ongoing Projects
                </h1>
              )}
              {tabs.map((tab) => (
                <div
                  key={tab.value}
                  role="tabpanel"
                  id={`panel-${tab.value}`}
                  aria-labelledby={`tab-${tab.value}`}
                  hidden={activeTab !== tab.value}
                  className="mt-6"
                >
                  {tab.content}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Layout>
    </section>
  );
}
