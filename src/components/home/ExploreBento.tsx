import { ArrowRight } from "lucide-react";
import { MediaCard, Reveal } from "@/components/ds";
import { ELabPhaseSwitch } from "@/components/e-lab/ELabPhaseSwitch";
import { eLabPhaseCopy, eLabProgramSummary } from "@/config/e-lab";
import { cn } from "@/lib/utils";
import { EXPLORE_CELLS, EXPLORE_GRID } from "./deferred-layout";

const DESTINATIONS = [
  {
    image: "/assets/open_ai_speaker_event.webp",
    eyebrow: "JOIN THE COMMUNITY",
    title: "Hackathons, Talks, Workshops, ...",
    description:
      "AI for Everyone - We offer a variety of events to help you learn and grow",
    action: "Explore Events",
    href: "/events",
    sizes: "(min-width: 1280px) 46rem, 100vw",
  },
  {
    image: "/assets/innovation/robotics_discussion.webp",
    eyebrow: "JOIN THE COMMUNITY",
    title: "Research",
    description:
      "Research projects and the Research Exchange (REX) Program for academically inclined minds",
    action: "Ongoing projects and publications",
    href: "/research",
    sizes: "(min-width: 1280px) 33rem, (min-width: 768px) 50vw, 100vw",
  },
  {
    image: "/assets/innovation/robotics_writing.webp",
    eyebrow: "JOIN THE COMMUNITY",
    title: "Innovation Departments",
    description:
      "Explore TUM.ai’s innovation departments and the exciting projects they lead",
    action: "Explore Departments and Projects",
    href: "/projects",
    sizes: "(min-width: 1280px) 33rem, (min-width: 768px) 50vw, 100vw",
  },
  {
    image: "/assets/home_img4.webp",
    eyebrow: (
      <ELabPhaseSwitch
        open={eLabPhaseCopy.open.teaserStatus}
        closed={eLabPhaseCopy.closed.teaserStatus}
      />
    ),
    title: "AI Entrepreneurship Lab (E-Lab)",
    description: `${eLabProgramSummary} with full support from Munich's innovation ecosystem`,
    action: "Learn more about E-Lab",
    href: "/e-lab",
    sizes: "(min-width: 1280px) 80rem, 100vw",
  },
] as const;

/**
 * The card's visible call to action. The arrow is glued to the last word so
 * it stays beside the text when the label wraps on narrow cards.
 */
function ActionLabel({ text }: { text: string }) {
  const words = text.split(" ");
  const last = words.pop();
  return (
    <span className="mt-5 block text-small font-semibold text-white">
      {words.length ? `${words.join(" ")} ` : null}
      <span className="whitespace-nowrap">
        {last}
        <ArrowRight
          aria-hidden
          className="ml-2 inline-block size-4 align-middle transition-transform duration-500 ease-brand group-hover/media:translate-x-1 motion-reduce:transition-none"
        />
      </span>
    </span>
  );
}

/**
 * The four ways into TUM.ai (events, research, innovation departments and
 * the E-Lab) as a bento of photo cards. Each card is one link: the title is
 * the accessible name and the action label is its visible affordance.
 * Loaded after hydration through DeferredHomeSections.
 */
export function ExploreBento() {
  return (
    <ul className={EXPLORE_GRID}>
      {DESTINATIONS.map((destination, index) => (
        <Reveal
          as="li"
          key={destination.href}
          delay={index * 90}
          className={EXPLORE_CELLS[index]}
        >
          <MediaCard
            href={destination.href}
            image={{ src: destination.image, alt: "" }}
            eyebrow={destination.eyebrow}
            title={destination.title}
            sizes={destination.sizes}
            fill
            scrim={index > 0 ? "strong" : "default"}
            className={cn(
              // The full-width E-Lab banner keeps its copy left, so its scrim
              // runs sideways and leaves the right of the photo bright.
              index === 3 &&
                "xl:after:pointer-events-none xl:after:absolute xl:after:inset-0 xl:after:bg-[linear-gradient(to_right,rgb(13_2_20/0.82)_0%,rgb(13_2_20/0.55)_40%,transparent_72%)]",
            )}
            description={
              <>
                {destination.description}
                <ActionLabel text={destination.action} />
              </>
            }
          />
        </Reveal>
      ))}
    </ul>
  );
}

export default ExploreBento;
