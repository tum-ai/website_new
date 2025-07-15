import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logos from "@/components/Logos";
import { project_partners } from "@/data/partners";
import { Separator } from "@/components/ui/separator";
import type { Research } from "@/lib/types";
import { useEffect, useState } from "react";
import ResearchCard from "@/components/research/ResearchCard";
import PastEvents from "@/components/events/past-events";


export default function Research() {
  const [projects, setProjects] = useState<Research[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Research[]>([]);
  const [pastProjects, setPastProjects] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/getResearch");// change this once deployed to /api/gerResearch
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
      const ongoing = projects.filter((project) => project.status === "ongoing");
      const past = projects.filter((project) => project.status === "completed");
      setOngoingProjects(ongoing);
      setPastProjects(past);
      // console.log("Ongoing Projects:", ongoing);
      // console.log("Past Projects:", past);
    }
  }, [projects]);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;


  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-white sm:py-16 lg:py-24">

        {/* Content Overlay */}
        <div className="inset-0 flex items-center justify-center flex-col mb-8">
          <div className="relative z-10 w-full max-w-5xl px-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-8 w-full max-w-2xl">
                <h1 className=" text-4xl font-bold text-white md:text-5xl">
                  Research
                </h1>
              </div>
              <p className="mx-auto max-w-2xl text-lg text-white">
                Our research offerings - from projects to exchange programs - are designed to foster innovation and collaboration in the field of AI. We aim to bridge the gap between academia and industry, providing opportunities for students and researchers to engage in impactful AI research.
              </p>
            </div>
          </div>

        </div>

        {/* Tabs Section */}
        <Tabs
          defaultValue="projects"
          className="w-full flex items-center justify-center px-30"
        >
          <TabsList className="w-full bg-transparent gap-4 justify-center text-xl">
            <TabsTrigger value="projects" className="text-white">
              Projects
            </TabsTrigger>
            <TabsTrigger value="exchange" className="text-white">
              Research Exchange (REX) Program
            </TabsTrigger>
          </TabsList>

          <Separator className="bg-gray-700 my-2" />

          <TabsContent value="projects">
            <section className="">
              <div className="container mx-auto">
                <div className="relative z-10 mx-auto max-w-6xl px-4">
                  <div className="mb-16 flex flex-col items-center">
                    <section className="flex flex-col items-center gap-4">
                      <h2 className="mb-2 text-center text-3xl font-semibold">
                        Research Projects
                      </h2>
                      <p className="mb-2 max-w-2xl text-center text-white">
                        TUM.ai conducts applied AI research through collaborative projects that address real-world challenges, resulting in academic publications or open-source contributions.
                      </p>

                      {ongoingProjects.length > 0 && ongoingProjects.map((project) => (
                        <ResearchCard title={project.title} description={project.description} image={project.image} publication={project.publication} />
                      ))}


                    </section>
                    <div className="my-8 h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>

                    <h3 className="mb-4 text-center text-3xl font-semibold">
                      Collaborators
                    </h3>
                    <Logos logos={project_partners} />

                    <div className="my-8 h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>

                    <h3 className="mb-4 text-center text-3xl font-semibold">
                      Past Projects
                    </h3>
                    <div className="flex flex-col items-center gap-4">
                      {pastProjects.length > 0 && pastProjects.map((project) => (
                        <ResearchCard title={project.title} description={project.description} image={project.image} publication={project.publication} />
                      ))}


                    </div>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>
          <TabsContent value="exchange">
            <section className="">
              <div className="container mx-auto">
                <div className="relative z-10 mx-auto max-w-6xl px-4">
                  <div className="mb-16 flex flex-col items-center">
                    <h2 className="mb-4 text-center text-3xl font-semibold">
                      REX
                    </h2>
                    <div className="flex flex-row gap-4">
                      <div className="flex flex-col flex-1/3 items-center justify-center gap-8">
                        <img
                          src="/assets/home_img1.jpg"
                          alt="alt text 1"
                          className="w-full"
                        />
                        <img
                          src="/assets/home_img2.png"
                          alt="alt text 2"
                          className="w-full"
                        />
                      </div>

                      <div className="flex flex-2/3 text-white text-lg/normal">

                        Our Research Exchange (REX) Program provides TUM.ai members with opportunities to conduct research abroad. Offers range from final theses to research internships with leading labs at institutions like Harvard, MIT, Cambridge, or INRIA. We collect project proposals from our partners, inform members about the requirements and usual processes, preselect applicants based on prior relevant (research) experience, recommend them to our partner labs, and eventually support their journey abroad with alumni experience in visa processes, housing, etc.

                        REX was launched based on the observation that members were already conducting research abroad and recommending others to follow in their footsteps. It is therefore a testament to our tight-knit community that we could build a network of great researchers who eagerly introduce our members to their respective fields and trust TUM.ai to provide curious minds.

                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>


      </section>
    </>
  );
}
