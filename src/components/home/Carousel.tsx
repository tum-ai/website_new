import { useState } from "react";
import Arrows from "./Arrows";
import CarouselItem from "./CarouselItem";

export const Carousel = () => {
  const [current, setCurrent] = useState(0);

  const data = [
    {
      imgSrc: "/assets/open_ai_speaker_event.jpg",
      text: "JOIN THE COMMUNITY",
      title: "Hackathons, Talks, Workshops, ...",
      desc: "AI for Everyone - We offer a variety of events to help you learn and grow",
      buttonText: "Explore Events",
      link: "/events",
    },
    {
      imgSrc: "/assets/innovation/robotics_discussion.png",
      text: "JOIN THE COMMUNITY",
      title: "Research",
      desc: "Research projects and the Research Exchange (REX) Program for academically inclined minds",
      buttonText: "Ongoing projects and publications",
      link: "/research",
    },
    {
      imgSrc: "/assets/innovation/robotics_writing.png",
      text: "JOIN THE COMMUNITY",
      title: "Innovation Departments",
      desc: "Explore TUM.ai’s innovation departments and the exciting projects they lead",
      buttonText: "Explore Departments and Projects",
      link: "/projects",
    },
    {
      imgSrc: "/assets/home_img4.jpg",
      text: "APPLICATIONS OPEN IN AUGUST",
      title: "AI Entrepreneurship Lab (AI E-Lab)",
      desc: "14-week equity-free AI startup incubator with full support from Munich's innovation ecosystem",
      buttonText: "Learn more about AI E-Lab",
      link: "/e-lab",
    },
  ];

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl w-full max-w-full">
      {/* slider wrapper */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
          width: `${data.length * 100}%`,
        }}
      >
        {data.map((item, index) => (
          <div key={index} className="w-full md:w-full flex flex-shrink-0">
            <CarouselItem {...item} />
          </div>
        ))}
      </div>

      {/* arrows */}
      <Arrows onPrev={prevSlide} onNext={nextSlide} />
    </div>
  );
};

export default Carousel;
