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
    <div className="flex flex-col gap-8 p-8 md:p-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          Our <span className="gradient-text">Values</span>
        </h2>
        <Benefits
          benefits={valuesWithIcons}
          columns={2}
          showShadow
          color="purple"
        />
      </div>
    </div>
  );
}
