import Layout from "@/components/Layout";
import { ProjectCard } from "@/components/innovation/InnovationProjectCard";
import { innovationProjects } from "@/data/projects";

export default function Projects() {
  return (
    <>
      <section className="brand-page-shell relative px-8 pt-32 pb-16 text-white">
        <Layout>
          <div className="relative min-h-screen">
            {/* Hero Section */}
            <div className="flex flex-col items-center gap-4 mb-12 px-6 text-center">
              <h1 className="text-4xl font-bold md:text-5xl text-white">
                Task Forces and Projects
              </h1>
              <p className="mx-auto text-subtitle text-gray-200">
                Explore the TUM.ai task forces driving research, education, and
                community initiatives across AI.
              </p>
            </div>
            <div className="w-full px-6 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {innovationProjects.map((project) => (
                  <div
                    key={project.name}
                    className="transition-transform duration-150 hover:scale-101"
                  >
                    <ProjectCard {...project} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Layout>
      </section>
    </>
  );
}
