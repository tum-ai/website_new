import { Card } from "@/components/ui/card";
import { type Department } from "@/data/community";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { iconColors as departmentColors } from "./JourneySection";

type IconName = keyof typeof LucideIcons;

const DepartmentCard = ({
  department,
  index,
}: {
  department: Department;
  index: number;
}) => {
  const Icon = LucideIcons[department.icon as IconName] as React.ElementType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      viewport={{ once: true }}
    >
      <Card
        className="h-full p-8 text-white rounded-3xl overflow-hidden relative border border-white/10"
        style={{
          backgroundColor: "#18112F",
          boxShadow:
            "0px 5px 15px rgba(0,0,0,0.2), 0px 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            background: `radial-gradient(circle at center, 0%, transparent 70%)`,
          }}
        ></div>
        <div className="relative z-10 mb-5 flex items-center gap-4">
          {Icon && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: departmentColors[index],
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h3 className="text-2xl font-semibold tracking-tight">
            {department.name}
          </h3>
        </div>
        <p className="relative z-10 leading-relaxed text-white/80">
          {department.description}
        </p>
      </Card>
    </motion.div>
  );
};

interface DepartmentsSectionProps {
  departments: Department[];
}

export default function DepartmentsSection({ departments }: DepartmentsSectionProps) {
  return (
    <div className="relative mx-auto max-w-7xl px-16 sm:px-6 py-16">
      <div className="mb-20 text-center">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Our Core Departments
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
          Discover the diverse teams that make TUM.ai thrive. Each department
          plays a crucial role in our mission to shape the future of AI.
        </p>
      </div>
      <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept, index) => (
          <DepartmentCard key={dept.name} department={dept} index={index} />
        ))}
      </div>
    </div>
  );
}
