import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Arrows from "./Arrows";
import Card from "./Card";

export const CarouselHome = () => {
  const data = [
    {
      imgSrc: "/assets/open_ai_speaker_event.webp",
      text: "JOIN THE COMMUNITY",
      title: "Hackathons, Talks, Workshops, ...",
      desc: "AI for Everyone - We offer a variety of events to help you learn and grow",
      buttonText: "Explore Events",
      link: "/events",
    },
    {
      imgSrc: "/assets/innovation/robotics_discussion.webp",
      text: "JOIN THE COMMUNITY",
      title: "Research",
      desc: "Research projects and the Research Exchange (REX) Program for academically inclined minds",
      buttonText: "Ongoing projects and publications",
      link: "/research",
    },
    {
      imgSrc: "/assets/innovation/robotics_writing.webp",
      text: "JOIN THE COMMUNITY",
      title: "Innovation Departments",
      desc: "Explore TUM.ai’s innovation departments and the exciting projects they lead",
      buttonText: "Explore Departments and Projects",
      link: "/projects",
    },
    {
      imgSrc: "/assets/home_img4.webp",
      text: "APPLICATIONS OPEN IN AUGUST",
      title: "AI Entrepreneurship Lab (AI E-Lab)",
      desc: "14-week equity-free AI startup incubator with full support from Munich's innovation ecosystem",
      buttonText: "Learn more about AI E-Lab",
      link: "/e-lab",
    },
  ];

  // TODO: refactor!!!
  return (
    <Carousel className="w-full max-w-full group">
      {/* slider wrapper */}
      <CarouselContent className="h-full">
        {data.map((item, index) => (
          <CarouselItem
            key={index}
            className="w-full md:w-full flex flex-shrink-0"
          >
            {" "}
            <div className="relative flex flex-col md:flex-row md:gap-8 px-4 md:px-10 py-14 md:py-12 justify-center w-dvw max-w-full">
              <img
                className="aspect-[16/9] object-cover rounded-md"
                src={item.imgSrc}
              />
              {/* card */}
              <div className="flex items-center">
                <Card
                  link={item.link}
                  text={item.text}
                  title={item.title}
                  desc={item.desc}
                  buttonText={item.buttonText}
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <Arrows />
    </Carousel>
  );
};

export default CarouselHome;
