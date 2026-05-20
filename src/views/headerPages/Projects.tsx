import Layout from "@/components/Layout";
import { ProjectCard } from "@/components/innovation/InnovationProjectCard";
import { innovationProjects } from "@/data/projects";

export default function Projects() {
  return (
    <section className="brand-page-shell relative overflow-hidden px-5 pt-32 pb-24 text-white sm:px-8">
      <Layout>
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-white md:text-6xl">
              Task Forces and Projects
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
              Explore the TUM.ai task forces driving research, education, and
              community initiatives across AI.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {innovationProjects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </div>
      </Layout>
    </section>
  );
}
