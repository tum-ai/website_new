type ArrowsProps = {
  onPrev: () => void;
  onNext: () => void;
};
const Arrows = ({ onPrev, onNext }: ArrowsProps) => {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4">
      <button
        onClick={onPrev}
        className="w-[57px] h-[57px] flex items-center !justify-center !rounded-full !bg-white shadow-md hover:bg-gray-100 transition"
      >
        <span className="text-lg font-bold text-gray-700">&lt;</span>
      </button>
      <button
        onClick={onNext}
        className="w-[57px] h-[57px] flex items-center !justify-center !rounded-full !bg-white shadow-md hover:bg-gray-100 transition"
      >
        <span className="text-lg font-bold text-gray-700">&gt;</span>
      </button>
    </div>
  );
};

export default Arrows;
