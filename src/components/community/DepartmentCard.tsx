import { iconColors } from "@/components/community/JourneySection";
import { Card } from "@/components/ui/card";
import { type Department } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Building2,
  Code,
  GraduationCap,
  Handshake,
  Lightbulb,
  Megaphone,
  Rocket,
  Scale,
  Users,
} from "lucide-react";
import React from "react";

const iconMap: Record<string, React.ElementType> = {
  Rocket,
  Building2,
  Code,
  Scale,
  Users,
  Megaphone,
  Handshake,
  Lightbulb,
  GraduationCap,
};

interface DepartmentCardProps {
  department: Department;
  index: number;
}

export const DepartmentCard = ({ department, index }: DepartmentCardProps) => {
  const Icon = iconMap[department.icon];

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
                color: iconColors[index % iconColors.length],
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
