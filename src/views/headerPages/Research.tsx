"use client";

import type React from "react";
import { useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import Logos from "@/components/Logos";
import ResearchCard from "@/components/research/ResearchCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Partner, Research } from "@/lib/types";

export default function Research({
  initialProjects = [],
  researchPartners = [],
}: {
  initialProjects?: Research[];
  researchPartners?: Partner[];
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
        <div className="space-y-14">
          <div>
            <h2 className="mb-6 text-2xl font-bold tracking-[-0.03em] text-white md:text-3xl">
              Ongoing Projects
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
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
          </div>

          {pastProjects.length > 0 && (
            <div>
              <h2 className="mb-6 text-2xl font-bold tracking-[-0.03em] text-white md:text-3xl">
                Past Projects
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
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
            </div>
          )}

          {Array.isArray(researchPartners) && researchPartners.length > 0 && (
            <div>
              <h2 className="mb-6 text-2xl font-bold tracking-[-0.03em] text-white md:text-3xl">
                Collaborators
              </h2>

              <Card className="overflow-hidden border-white/10 bg-white/5">
                <CardContent className="bg-minimal-gray px-0">
                  <Logos
                    logos={researchPartners
                      .filter((p) => p.link && p.image)
                      .map((partner) => ({
                        href: partner.link!,
                        src: partner.image!,
                        alt: partner.name,
                      }))}
                  />
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
        <div className="mx-auto max-w-4xl space-y-6 rounded-lg bg-black/25 p-6 md:p-10">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-white">
            Research Exchange (REX) Program
          </h2>

          <p className="text-lg leading-relaxed text-white/70">
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

          <p className="text-lg leading-relaxed text-white/70">
            We collect project proposals from our partners, inform members about
            the requirements and usual processes, preselect applicants based on
            prior relevant (research) experience, recommend them to our partner
            labs, and eventually support their journey abroad with alumni
            experience in visa processes, housing, etc.
          </p>

          <p className="text-lg leading-relaxed text-white/70">
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
    <section className="brand-page-shell relative min-h-screen overflow-hidden px-5 pt-32 pb-24 text-white sm:px-8">
      <Layout>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-white md:text-6xl">
              Research
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
              Our research offerings - from projects to exchange programs
            </p>
          </div>

          {tabs.length > 1 ? (
            <>
              <div
                role="tablist"
                aria-label="Research tabs"
                className="mb-16 inline-flex w-full rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-2xl shadow-black/20 backdrop-blur-sm sm:w-auto"
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
                        "h-9 w-full !rounded-full !px-5 !py-0 text-center text-sm font-semibold transition-[background-color,color,box-shadow] focus:!outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:w-auto " +
                        (selected
                          ? "!bg-primary text-white shadow-sm hover:!bg-dark-purple"
                          : "!bg-transparent text-white/62 hover:!bg-white/8 hover:text-white")
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
                >
                  {tab.content}
                </div>
              ))}
            </>
          ) : null}
        </div>
      </Layout>
    </section>
  );
}
