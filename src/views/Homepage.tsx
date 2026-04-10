import Layout from "@/components/Layout";
import { AboutSection } from "@/components/home/AboutSection";
import { CarouselHome } from "@/components/home/CarouselHome";
import { Grid } from "@/components/home/Grid";
import { PartnersSection } from "@/components/home/PartnersSection";
import { ScrollSection } from "@/components/home/ScrollSection";
import { Hero } from "../components/ui/hero";

export default function Homepage() {
  return (
    <>
      <div className="brand-home-hero relative min-h-screen text-white">
        <div className="hidden sm:block">
          <Grid />
          <div className="brand-home-hero-overlay absolute inset-0 pointer-events-none" />
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
    </>
  );
}
