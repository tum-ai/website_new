import {
  initiatives_collabrated_with,
  // partners_collabrated_with,
} from "@/data/partners";
import { useEffect, useState } from "react";

type PartnersData = {
  id: string;
  name: string;
  link: string;
  image: string;
};

export const PartnersSection = () => {
  const [partners, setPartners] = useState<PartnersData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/getPartners"); // change this once deployed to /api/getPartners
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setPartners(data);
      } catch (err) {
        console.error(err);
        setError("Could not load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) return <div>Loading partners...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  return (
    <section className="relative overflow-hidden p-8 py-24 sm:py-16 lg:py-24">
      {/* Glass-like glow */}
      <div className="absolute top-1/3 right-1/4 h-[25vw] max-h-96 w-[25vw] max-w-96 rounded-full bg-gradient-to-br from-purple-300/10 to-blue-300/5 blur-3xl"></div>
      <div className="absolute bottom-1/3 left-1/4 h-[15vw] max-h-64 w-[15vw] max-w-64 rounded-full bg-gradient-to-tr from-blue-300/10 to-purple-300/5 blur-3xl"></div>

      <div className="container mx-auto">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <h2 className="mb-16 text-center text-3xl font-semibold">
            Our <span className="text-purple-600">Partners</span>
          </h2>

          <div className="grid grid-cols-2 items-center justify-items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
            {[...partners].reverse().map((partner) => (
              <div
                key={partner.id}
                className="flex transform items-center justify-center p-4 grayscale transition-all duration-300 hover:scale-105 hover:grayscale-0"
              >
                <a href={partner.link} target="_blank">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="h-12 object-contain"
                />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const InitiativePartnersSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 p-8 sm:py-16 lg:py-24">
      {/* Dot pattern background */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-40 gap-8 md:grid-cols-40">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-purple-500" />
          ))}
        </div>
      </div>

      <div className="container mx-auto">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <h2 className="mb-16 text-center text-3xl font-semibold">
            Partner <span className="text-purple-600">Initiatives</span>
          </h2>

          <div className="grid grid-cols-2 items-center justify-items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
            {initiatives_collabrated_with.map((initiative, index) => (
              <div
                key={index}
                className="flex transform items-center justify-center p-4 grayscale transition-all duration-300 hover:scale-105 hover:grayscale-0"
              >
                <img
                  src={initiative.src}
                  alt={initiative.alt}
                  className="h-12 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
