import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Arrows from "./Arrows";
import Card from "./Card";

const CAROUSEL_ITEMS = [
  {
    imgSrc: "/assets/open_ai_speaker_event.webp",
    width: 1920,
    height: 1280,
    text: "JOIN THE COMMUNITY",
    title: "Hackathons, Talks, Workshops, ...",
    desc: "AI for Everyone - We offer a variety of events to help you learn and grow",
    buttonText: "Explore Events",
    link: "/events",
  },
  {
    imgSrc: "/assets/innovation/robotics_discussion.webp",
    width: 1920,
    height: 1440,
    text: "JOIN THE COMMUNITY",
    title: "Research",
    desc: "Research projects and the Research Exchange (REX) Program for academically inclined minds",
    buttonText: "Ongoing projects and publications",
    link: "/research",
  },
  {
    imgSrc: "/assets/innovation/robotics_writing.webp",
    width: 1231,
    height: 922,
    text: "JOIN THE COMMUNITY",
    title: "Innovation Departments",
    desc: "Explore TUM.ai’s innovation departments and the exciting projects they lead",
    buttonText: "Explore Departments and Projects",
    link: "/projects",
  },
  {
    imgSrc: "/assets/home_img4.webp",
    width: 1920,
    height: 1080,
    text: "APPLICATIONS OPEN IN AUGUST",
    title: "AI Entrepreneurship Lab (E-Lab)",
    desc: "14-week equity-free AI startup incubator with full support from Munich's innovation ecosystem",
    buttonText: "Learn more about E-Lab",
    link: "/e-lab",
  },
];

export const CarouselHome = () => {
  return (
    <Carousel className="group w-full max-w-full">
      <CarouselContent className="h-full">
        {CAROUSEL_ITEMS.map((item) => (
          <CarouselItem
            key={item.link}
            className="flex w-full flex-shrink-0 md:w-full"
          >
            <div className="relative flex w-dvw max-w-full flex-col justify-center px-4 pb-12 md:flex-row md:px-10">
              <Image
                className="aspect-[16/9] rounded-md object-cover"
                src={item.imgSrc}
                alt={item.title}
                width={item.width}
                height={item.height}
                sizes="(min-width: 768px) 50vw, 100vw"
                loading="lazy"
              />
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
