import { useCarousel } from "../ui/carousel";

const Arrows = () => {
  const { scrollPrev, scrollNext } = useCarousel();
  return (
    <div className="md:absolute md:bottom-16 md:right-0 md:-translate-x-1/2 relative flex items-center justify-center bottom-5 gap-4">
      <button
        onClick={() => scrollPrev()}
        className="w-[3.5rem] h-[3.5rem] flex items-center !justify-center !rounded-full !bg-white shadow-md hover:bg-gray-100 transition"
      >
        <span className="text-lg font-bold text-gray-700">&lt;</span>
      </button>
      <button
        onClick={() => scrollNext()}
        className="w-[3.5rem] h-[3.5rem] flex items-center !justify-center !rounded-full !bg-white shadow-md hover:bg-gray-100 transition"
      >
        <span className="text-lg font-bold text-gray-700">&gt;</span>
      </button>
    </div>
  );
};

export default Arrows;
