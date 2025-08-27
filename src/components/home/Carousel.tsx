import { useState } from "react";
import CarouselItem from "./CarouselItem";
import Arrows from "./Arrows";

const Carousel = () => {
  const [current, setCurrent] = useState(0);

  const data = [
    {
      imgSrc: "/assets/home_img4.jpg",
      text: "APPLICATIONS OPEN IN AUGUST",
      title: "AI Entrepreneurship Lab (AI E-Lab)",
      desc: "14-week equity-free AI startup incubator with full support from Munich's innovation ecosystem",
      buttonText: "Learn more about AI E-Lab",
    },
    {
      imgSrc: "/assets/home_img1.jpg",
      text: "JOIN THE COMMUNITY",
      title: "AI Founders Network",
      desc: "Connect with innovators, mentors, and investors shaping the future of AI startups.",
      buttonText: "Explore the Network",
    },
  ];

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl w-full">
      {/* slider wrapper */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
          width: `${data.length * 100}%`,
        }}
      >
        {data.map((item, index) => (
          <div key={index} className="w-full md:w-full flex-shrink-0">
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
