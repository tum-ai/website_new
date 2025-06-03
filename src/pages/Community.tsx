import { Card } from "@/components/ui/card";
import { cx } from "class-variance-authority";
import {
  Building2,
  Code,
  GraduationCap,
  Handshake,
  Megaphone,
  Rocket,
  Scale,
  Users,
} from "lucide-react";
import { Img } from "react-image";

interface Department {
  name: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
}

const departments: Department[] = [
  {
    name: "Makeathon",
    icon: Rocket,
    description:
      "Organizing Munich's largest AI Makeathon - a 48-hour virtual challenge where teams develop real-world business cases with AI. Features workshops, talks, and expert mentorship.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Venture",
    icon: Building2,
    description:
      "Bridging the gap between ideas and successful AI startups. We foster innovation and entrepreneurial spirit within TUM.ai.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Industry",
    icon: GraduationCap,
    description:
      "Connecting TUM.ai members with industry partners for real-world AI projects during lecture-free periods.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Education",
    icon: GraduationCap,
    description:
      "Creating and delivering AI educational content and events for all skill levels - from beginner to expert.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Software Dev",
    icon: Code,
    description:
      "Building and maintaining TUM.ai's digital infrastructure, from in-house tools to cloud services.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Legal & Finance",
    icon: Scale,
    description:
      "Ensuring TUM.ai's compliance and financial sustainability while maintaining our non-profit status.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Community",
    icon: Users,
    description:
      "Building and nurturing our community through events, buddy programs, and recruitment.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Marketing",
    icon: Megaphone,
    description:
      "Shaping TUM.ai's public image and promoting our vision through strategic communication.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Partners & Sponsors",
    icon: Handshake,
    description:
      "Building strategic partnerships and securing sponsorships to enable ambitious events and projects.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
];

const DepartmentCard = ({ department }: { department: Department }) => {
  const Icon = department.icon;
  return (
    <Card className="h-full p-8">
      <div className="relative mb-5 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/15">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-white">
          {department.name}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-300">
        {department.description}
      </p>
    </Card>
  );
};

export default function Community() {
  return (
    <>
      {/* Main Content */}

      {/* Departments Section - Dark gradient background */}
      <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-grid-slate-100 absolute inset-0 opacity-5 [mask-image:linear-gradient(0deg,white,transparent)]" />
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2">
              <h2
                className={cx(
                  "text-3xl font-semibold tracking-tight text-white",
                )}
              >
                Our Core Departments
              </h2>
            </div>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Discover the diverse teams that make TUM.ai thrive. Each
              department plays a crucial role in our mission to shape the future
              of AI.
            </p>
          </div>
          <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <DepartmentCard key={dept.name} department={dept} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
