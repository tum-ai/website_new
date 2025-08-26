import Grid from "@/components/Grid.tsx";
import { NewHero } from "../components/ui/newHero.tsx";

export default function NewHomepage() {
  return (
    <div className="">
      <div className="relative flex flex-row bg-[#0B0213] text-white min-h-screen pt-16 px-6">
        {/* Hero content */}
        <NewHero />
        {/* Grid of squares (bottom right) */}
        <Grid />
      </div>
    </div>
  );
}
