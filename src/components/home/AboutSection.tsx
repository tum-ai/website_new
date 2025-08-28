import { Button } from "../ui/button";

export const AboutSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 p-8 sm:py-16 lg:py-24">
      {/* Glass-like shapes */}
      <div className="absolute top-1/4 right-0 h-[20vw] max-h-64 w-[20vw] max-w-64 rounded-full bg-gradient-to-br from-purple-300/10 to-blue-300/5 blur-3xl"></div>
      <div className="absolute bottom-1/3 left-0 h-[25vw] max-h-96 w-[25vw] max-w-96 rounded-full bg-gradient-to-tr from-blue-300/10 to-purple-300/5 blur-3xl"></div>

      <div className="container mx-auto">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-16 lg:flex-row">
            <div className="lg:w-1/2">
              <h2 className="mb-8 text-3xl font-semibold">
                Germany&apos;s leading
                <br />
                <span className="text-purple-600">AI student initiative</span>
              </h2>

              <div className="space-y-6 text-gray-700">
                <p className="font-medium text-black">
                  Founded in 2020, <strong>TUM.ai</strong> is a community of{" "}
                  <strong>250+ students</strong> driving positive impact with
                  AI.
                </p>

                <p className="font-medium text-black">
                  We partner with{" "}
                  <strong>companies, researchers, and innovators</strong> on
                  research, industry projects, our{" "}
                  <strong>entrepreneurship lab</strong>, and{" "}
                  <strong>speaker events</strong> to turn ideas into action.
                </p>
              </div>

              <div className="mt-10">
                <Button asChild variant="primary">
                  <a href="/community#memberStories">
                    <span className="relative z-10">Meet our Members</span>
                  </a>
                </Button>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative h-[500px] w-full overflow-hidden rounded-2xl">
                <div className="absolute inset-0 -m-1 rounded-2xl bg-gradient-to-br from-purple-100/20 to-blue-100/20 backdrop-blur-[2px]"></div>
                <div className="absolute inset-1 overflow-hidden rounded-xl border border-white/20 shadow-lg">
                  <img
                    src="/assets/aibootcamp.jpg"
                    alt="TUM.ai members collaborating"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
