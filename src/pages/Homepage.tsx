import { AboutSection } from "@/components/home/AboutSection";
import { Carousel } from "@/components/home/Carousel";
// import { EventsSection } from "@/components/home/EventsSection";
import { Grid } from "@/components/home/Grid";
import { PartnersSection } from "@/components/home/PartnersSection";
import { ScrollSection } from "@/components/home/ScrollSection";
import { Hero } from "../components/ui/hero";

export default function Homepage() {
  return (
    <div className="">
      <div className="relative flex flex-row bg-[#0B0213] text-white min-h-screen pt-16 px-6">
        <Hero />
        {/* Grid of squares (bottom right) */}
        <Grid />
      </div>
      <AboutSection />
      <ScrollSection />
      <PartnersSection />
      <Carousel />
      {/* <EventsSection /> */}
    </div>
  );
}
