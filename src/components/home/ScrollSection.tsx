import "../../styles/index.css";

export function ScrollSection() {
  const data = [
    { id: 1, src: "/assets/home_img1.jpg" },
    {
      id: 2,
      src: "/assets/home_img2.png",
    },
    { id: 3, src: "/assets/e-lab/e-phases/ideation.jpeg" },
    {
      id: 4,
      src: "/assets/innovation/med_ai.jpg",
    },
    { id: 5, src: "/assets/home_img5.jpeg" },
    { id: 6, src: "/assets/home_img4.jpg" },
    {
      id: 7,
      src: "/assets/innovation/robotics_discussion.png",
    },
    { id: 8, src: "/assets/innovation/accelerated_computing.png" },
  ];

  const doubledData = [...data, ...data]; // duplicate for seamless scroll

  return (
    <div className="relative overflow-hidden w-full">
      <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none"></div>
      {/* Right fade gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 bg-gradient-to-l from-white via-gray-50/70 to-transparent z-10 pointer-events-none"></div>
      <div className="flex flex-nowrap animate-scroll-left">
        {doubledData.map((imgObj, idx) => (
          <img
            key={idx}
            src={imgObj.src}
            alt=""
            className="h-48 sm:h-64 lg:h-80 w-auto flex-shrink-0 mx-4"
          />
        ))}
      </div>
    </div>
  );
}

export default ScrollSection;
