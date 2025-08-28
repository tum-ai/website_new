import Grid from "@/components/home/Grid";
import { Hero } from "../components/ui/hero";
import { AboutSection } from "@/components/home/AboutSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import Carousel from "@/components/home/Carousel";
import ScrollSection from "@/components/home/ScrollSection";

export default function Header() {
  return (
    <div className="">
      <div className="relative flex flex-row bg-[#0B0213] text-white min-h-screen pt-16 px-6">
        {/* Hero content */}
        <Hero />
        {/* Grid of squares (bottom right) */}
        <Grid />
      </div>
      <AboutSection />
      <PartnersSection />
      <Carousel />
      <ScrollSection />
    </div>
  );
}
