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
    <section className="container mx-auto max-w-5xl px-4 py-16">
      <h3 className="text-title md:text-4xl font-bold mb-4">
        Is TUM.ai the right choice for me?
      </h3>
      <p className="text-subtitle text-gray-600 mb-2">
        There is no secret to TUM.ai's fast-paced growth. Every semester, we
        have recruited amazing members who drive the initiative forward. If you
        can identify with the following qualities, you are the one that we are
        looking for!
      </p>

      <Benefits
        benefits={requirementsWithIcons}
        columns={2}
        showShadow
        color="purple"
      />
    </section>
  );
}
