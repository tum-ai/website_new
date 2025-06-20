import { useMemo } from "react";
import { munichFaqs, values, requirements, stories } from "@/data/munich";
import Hero from "@/components/munich/Hero";
import About from "@/components/munich/About";
import Milestones from "@/components/munich/Milestones";
import MemberJourney from "@/components/munich/MemberJourney";
import Values from "@/components/munich/Values";
import MemberStories from "@/components/munich/MemberStories";
import Requirements from "@/components/munich/Requirements";
import FAQ from "@/components/munich/FAQ";
import Outro from "@/components/munich/Outro";

export default function Munich() {
    const valuesWithIcons = useMemo(() => values, []);
    const requirementsWithIcons = useMemo(() => requirements, []);

    return (
        <div className="flex flex-col">
            <Hero />
            <About />
            <Milestones />
            <MemberJourney />
            <Values valuesWithIcons={valuesWithIcons} />
            <MemberStories stories={stories} />
            <Requirements requirementsWithIcons={requirementsWithIcons} />
            <FAQ munichFaqs={munichFaqs} />
            <Outro />
        </div>
    );
}
