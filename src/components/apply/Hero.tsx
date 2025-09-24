import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black px-4 text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-bold">
              Join <span className="gradient-text">Us</span>
            </h1>
            <p className="text-subtitle md:text-xl">
              Are you a young innovator passionate about making a difference?
            </p>
            <div className="font-semibold text-subtitle md:text-xl">
              We're here to bridge the gap by connecting you with key
              stakeholders in your field. Together, we can harness the power of
              AI for transformative, interdisciplinary projects that drive
              tangible social change.
            </div>
            <div className="flex flex-col items-center md:items-start gap-4 mt-4">
              <Button asChild variant="primary" className="px-8 py-4 text-lg">
                <NavLink to="https://tally.so/r/3yLqY6">Apply Now!</NavLink>
              </Button>
              <p className="text-sm font-thin mt-1">
                Application deadline: 27th October 2025
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center">
            <img
              src="/assets/logo_new_white_standard.png"
              alt="TUM.ai Logo"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
