import { Container, PageHero, Section } from "@/components/ds";
import { ClosingSection } from "./closing-section";
import { figureSeats, hero } from "./data/copy";
import { taskForces } from "./data/projects";
import { OverlapsFigure } from "./overlaps-figure";
import { TaskForceChapter } from "./task-force-chapter";

/**
 * /projects, the task forces. The page's one bold element is the figure in
 * the hero: AI in the middle and one circle per field around it, where each
 * overlap is a task force and links to its chapter. The chapters follow the
 * figure clockwise, and the close returns to it with the open circle, the
 * next task force, drawn solid.
 */
export function ProjectsPage() {
  return (
    <main>
      <PageHero
        tone="night"
        mark={false}
        titleId="projects-hero-title"
        eyebrow={hero.eyebrow}
        title={hero.title}
        emphasis="highlight"
        lead={hero.lead}
        classNames={{
          grid: "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center",
          media: "mx-auto w-full max-w-md lg:max-w-none",
        }}
        media={
          <OverlapsFigure
            seats={figureSeats}
            variant="index"
            label={hero.figureLabel}
          />
        }
      />

      <Section tone="paper" spacing="md" aria-label="Task forces">
        <Container>
          {taskForces.map((taskForce, index) => (
            <TaskForceChapter
              key={taskForce.slug}
              taskForce={taskForce}
              index={index}
              seatCount={figureSeats.length}
            />
          ))}
        </Container>
      </Section>

      <ClosingSection />
    </main>
  );
}
