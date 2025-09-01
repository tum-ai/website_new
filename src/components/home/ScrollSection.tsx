import "../../styles/index.css";

function ScrollSection() {
  const data = [
    { img: "/assets/scroll/1.png" },
    { img: "/assets/scroll/2.png" },
    { img: "/assets/scroll/3.png" },
    { img: "/assets/scroll/4.png" },
    { img: "/assets/scroll/5.png" },
    { img: "/assets/scroll/6.png" },
  ];

  const doubledData = [...data, ...data]; // duplicate for seamless scroll

  return (
    <div className="overflow-hidden w-full my-40">
      <div className="flex animate-scroll-left">
        {doubledData.map((imgObj, idx) => (
          <img
            key={idx}
            src={imgObj.img}
            alt=""
            className="h-80 w-auto flex-shrink-0 mx-4"
          />
        ))}
      </div>
    </div>
  );
}

export default ScrollSection;
