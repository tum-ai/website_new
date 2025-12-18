import { departments } from "@/data/community";
import { DepartmentCard } from "./DepartmentCard";

export const DepartmentsSection = () => (
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
