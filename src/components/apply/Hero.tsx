import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="brand-page-shell relative flex h-screen w-full items-center justify-center overflow-hidden px-4 text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold">
              <b className="brand-highlight-text font-bold">Join </b>
              Us
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
                <a
                  href="https://tally.so/r/OD0Vgg"
                  target="blank"
                  rel="noopener noreferrer"
                >
                  Apply now
                </a>
              </Button>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center">
            <img
              src="/assets/tum_ai_logo_new.svg"
              alt="TUM.ai Logo"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
