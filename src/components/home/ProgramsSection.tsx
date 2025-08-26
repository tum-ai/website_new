import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../ui/card";

export const ProgramsSection = () => {
  return (
    // Programs Section
    <section className="relative overflow-hidden p-8 py-24 sm:py-16 lg:py-24">
      {/* Decorative dots */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-20 grid-rows-40 gap-8 opacity-5 md:grid-cols-40">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full bg-purple-500"
            style={{
              transform: `translate(${Math.random() * 100}%, ${Math.random() * 100}%)`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto">
        <div className="relative mx-auto max-w-7xl px-4">
          <h2 className="mb-16 text-center text-3xl font-semibold">
            Our <span className="text-purple-600">Programs</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Research Card */}
            <ProgramCard
              title="Research Projects"
              image="/assets/home_img4.jpg"
              description="Research projects in AI and machine learning"
              link="/research"
              cta="See past publications and projects"
              ProgramStatus={{
                status: "New projects starting in October",
                open: true,
              }}
            />

            {/* Hackathon Card */}
            <ProgramCard
              title="Hackathon Competitions"
              image="/assets/home_img2.png"
              description="48-hour AI product development hackathon solving real industry challenges"
              link="https://makeathon.tum-ai.com/"
              cta="View hackathons"
              ProgramStatus={{ status: "Coming Soon", open: true }}
            />

            {/* E-Lab Card */}
            <ProgramCard
              title="AI Entrepreneurship Lab"
              image="/assets/home_img4.jpg"
              description="14-week equity-free AI startup incubator with full support from Munich's innovation ecosystem"
              link="/e-lab"
              cta="Learn more"
              ProgramStatus={{
                status: "Applications open in August",
                open: true,
              }}
            />

            {/* Industry Projects Card */}
            <ProgramCard
              title="Industry Projects"
              image="/assets/home_img3.png"
              description="Paid student teams implementing data-driven solutions for partner companies"
              link="/industry"
              cta="Explore projects"
              ProgramStatus={{ status: "Applications closed", open: false }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
interface ProgramStatus {
  status: string;
  open: boolean;
}
const getStatusClasses = (isOpen: boolean) => ({
  dot: `mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isOpen ? "bg-purple-500" : "bg-gray-400"}`,
  text: `text-xs font-medium ${isOpen ? "text-purple-600" : "text-gray-400"}`,
});
function ProgramCard({
  title,
  image,
  description,
  link,
  cta,
  ProgramStatus,
}: {
  title: string;
  image: string;
  description: string;
  link: string;
  cta: string;
  ProgramStatus: ProgramStatus;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden py-0 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md">
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <CardContent className="flex flex-1 flex-col px-6 py-5">
        <CardTitle className="mb-3 text-lg font-medium">{title}</CardTitle>
        <div>
          {ProgramStatus &&
            (() => {
              const classes = getStatusClasses(ProgramStatus.open);

              return (
                <div className="mb-2 flex items-center">
                  <span className={classes.dot} />
                  <p className={classes.text}>{ProgramStatus.status}</p>
                </div>
              );
            })()}
        </div>
        <CardDescription className="mb-2 text-sm text-gray-600">
          {description}
        </CardDescription>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <a
          href={link}
          className="inline-flex items-center mb-2 text-sm font-medium text-purple-600 transition-colors hover:text-purple-800"
        >
          {cta}
        </a>
      </CardFooter>
    </Card>
  );
}
