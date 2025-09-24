import Benefits from "@/components/Benefit";
import type { LucideIcon } from "lucide-react";

interface Value {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface ValuesProps {
  valuesWithIcons: Value[];
}

export default function Values({ valuesWithIcons }: ValuesProps) {
  return (
    <section className="container mx-auto max-w-5xl py-16">
      <h3 className="text-3xl md:text-4xl font-bold mb-4">
        Our <span className="gradient-text">Values</span>
      </h3>
      <Benefits
        benefits={valuesWithIcons}
        columns={2}
        showShadow
        color="purple"
      />
    </section>
  );
}
