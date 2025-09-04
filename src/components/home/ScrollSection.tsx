import "../../styles/index.css";

export function ScrollSection() {
  const data = [
    { id: 1, src: "/assets/home_img1.jpg" },
    {
      id: 2,
      src: "/assets/home_img2.png",
    },
    { id: 3, src: "public/assets/e-lab/e-phases/ideation.jpeg" },
    {
      id: 4,
      src: "public/assets/innovation/med_ai.jpg",
    },
    { id: 5, src: "/assets/home_img5.jpeg" },
    { id: 6, src: "/assets/home_img4.jpg" },
    {
      id: 7,
      src: "public/assets/innovation/robotics_discussion.png",
    },
    { id: 8, src: "public/assets/innovation/accelerated_computing.png" },
  ];

  const doubledData = [...data, ...data]; // duplicate for seamless scroll

  return (
    <div className="overflow-hidden w-full my-10">
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
