import Benefits from "@/components/Benefit";
import type { LucideIcon } from "lucide-react";

interface Requirement {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface RequirementsProps {
  requirementsWithIcons: Requirement[];
}

export default function Requirements({
  requirementsWithIcons,
}: RequirementsProps) {
  return (
    <div className="flex flex-col gap-8 p-8 md:p-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          Is TUM.ai the right choice for me?
        </h2>
        <p className="text-xl md:text-2xl animate-item pb-8">
          There is no secret to TUM.ai's fast-paced growth. Every semester, we
          have recruited amazing members who drive the initiative forward. If
          you can identify with the following qualities, you are the one that we
          are looking for!
        </p>
        <Benefits
          benefits={requirementsWithIcons}
          columns={2}
          showShadow
          color="purple"
        />
      </div>
    </div>
  );
}
