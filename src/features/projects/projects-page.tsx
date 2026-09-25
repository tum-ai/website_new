import { Container, PageHero, Reveal, Section } from "@/components/ds";
import { cn } from "@/lib/cn";
import { projects } from "./data/projects";
import { ProjectCard } from "./project-card";

/*
 * Bento on wide screens (six-column grid): the first two task forces lead as
 * landscape tiles, the rest follow as 4:5 portraits, three to a row. On
 * tablets it is a two-column grid whose odd last tile spans the full row.
 */
function tileLayout(index: number, count: number) {
  const featured = index < 2;
  const lastOdd = index === count - 1 && count % 2 === 1;
  return {
    item: cn(
      featured ? "xl:col-span-3" : "xl:col-span-2",
      lastOdd && "md:col-span-2 xl:col-span-2",
    ),
    tile: cn(
      featured && "xl:aspect-[4/3]",
      lastOdd && "md:aspect-[16/9] xl:aspect-[4/5]",
    ),
    sizes: featured
      ? "(min-width: 1280px) 50vw, (min-width: 768px) 50vw, 100vw"
      : lastOdd
        ? "(min-width: 1280px) 33vw, 100vw"
        : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
  };
}

export function ProjectsPage() {
  const count = projects.length;
  return (
    <main>
      <PageHero
        title="Task Forces and Projects"
        lead="Explore the TUM.ai task forces driving research, education, and community initiatives across AI."
      />

      <Section tone="paper" spacing="md" aria-labelledby="task-forces-title">
        <Container>
          {/* The hero already introduces the grid; the heading keeps the
              outline (h1 > h2 > h3) for assistive tech. */}
          <h2 id="task-forces-title" className="sr-only">
            Task forces
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-6 xl:gap-6">
            {projects.map((project, index) => {
              const layout = tileLayout(index, count);
              return (
                <Reveal
                  as="li"
                  key={project.name}
                  delay={(index < 2 ? index : index - 2) * 90}
                  className={layout.item}
                >
                  <ProjectCard
                    {...project}
                    index={index}
                    className={layout.tile}
                    sizes={layout.sizes}
                  />
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
