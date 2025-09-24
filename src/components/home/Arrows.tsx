import { useCarousel } from "../ui/carousel";

const Arrows = () => {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <div className="md:absolute md:bottom-16 md:right-0 md:-translate-x-1/2 relative flex items-center justify-center bottom-5 gap-4">
      <button
        onClick={() => scrollPrev()}
        disabled={!canScrollPrev}
        aria-disabled={!canScrollPrev}
        className={
          `w-[3.5rem] h-[3.5rem] flex items-center !justify-center !rounded-full ` +
          (canScrollPrev
            ? "!bg-white !shadow-md transition"
            : "!bg-white/60 !opacity-60 pointer-events-none transition")
        }
      >
        <span
          className={`text-lg font-bold ${
            canScrollPrev ? "text-gray-700" : "text-gray-400"
          }`}
        >
          &lt;
        </span>
      </button>
      <button
        onClick={() => scrollNext()}
        disabled={!canScrollNext}
        aria-disabled={!canScrollNext}
        className={
          `w-[3.5rem] h-[3.5rem] flex items-center !justify-center !rounded-full ` +
          (canScrollNext
            ? "!bg-white !shadow-md transition"
            : "!bg-white/60 !opacity-60 pointer-events-none transition")
        }
      >
        <span
          className={`text-lg font-bold ${
            canScrollNext ? "text-gray-700" : "text-gray-400"
          }`}
        >
          &gt;
        </span>
      </button>
    </div>
  );
};

export default Arrows;
