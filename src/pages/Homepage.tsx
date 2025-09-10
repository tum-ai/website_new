import Layout from "@/components/Layout";
import { AboutSection } from "@/components/home/AboutSection";
import { CarouselHome } from "@/components/home/CarouselHome";
// import { EventsSection } from "@/components/home/EventsSection";
import { Grid } from "@/components/home/Grid";
import { PartnersSection } from "@/components/home/PartnersSection";
import { ScrollSection } from "@/components/home/ScrollSection";
import { Hero } from "../components/ui/hero";

export default function Homepage() {
  return (
    <>
      <title>Home - TUM.ai</title>
      <div className="relative bg-[#0B0213] text-white min-h-screen">
        <div className="hidden sm:block">
          <Grid />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top right, #0D0214 20%, transparent)",
            }}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen sm:items-end sm:justify-start sm:pl-8 sm:pb-8">
          <Hero />
        </div>
      </div>
      <Layout>
        <AboutSection />
        <ScrollSection />
        <CarouselHome />
        <PartnersSection />
      </Layout>
      {/* <EventsSection /> */}
    </>
  );
}
