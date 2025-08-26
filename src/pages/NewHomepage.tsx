import { NewHero } from "../components/ui/newHero.tsx";

export default function NewHomepage() {
  const squares = [
    { id: 1, src: "public/assets/home_img1.jpg", opacity: "opacity-0" },
    { id: 2, src: "public/assets/home_img1.jpg", opacity: "opacity-10" },
    { id: 3, src: "public/assets/home_img1.jpg", opacity: "opacity-20" },
    { id: 4, src: "public/assets/home_img1.jpg", opacity: "opacity-10" },
    { id: 5, src: "public/assets/home_img1.jpg", opacity: "opacity-20" },
    { id: 6, src: "public/assets/home_img5.jpeg", opacity: "opacity-30" },
    { id: 7, src: "public/assets/home_img4.jpg", opacity: "opacity-20" },
    { id: 8, src: "public/assets/home_img2.png", opacity: "opacity-30" },
    { id: 9, src: "public/assets/home_img1.jpg", opacity: "opacity-30" },
  ];

  return (
    <div className="relative flex flex-row bg-[#0B0213] text-white min-h-screen pt-16 px-6">
      {/* Hero content */}
      <NewHero />

      {/* Grid of squares (bottom right) */}
      <div className="hidden absolute bottom-8 right-8 lg:grid grid-cols-3 gap-3 w-40 sm:w-60 md:w-72">
        {squares.map(({ id, src, opacity }) => (
          <div
            key={id}
            className={`relative aspect-square rounded-xl overflow-hidden bg-[#6517A1] ${opacity}`}
          >
            {src && (
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover mix-blend-overlay"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
