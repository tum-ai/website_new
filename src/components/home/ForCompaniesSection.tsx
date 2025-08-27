import { Button } from "../ui/button";

export const ForCompaniesSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-white sm:py-16 lg:py-24">
      {/* Glowing orbs */}
      <div className="absolute top-20 right-20 h-[20vw] max-h-80 w-[20vw] max-w-80 rounded-full bg-purple-400/10 blur-[clamp(40px,5vw,100px)]"></div>
      <div className="absolute bottom-20 left-20 h-[20vw] max-h-80 w-[20vw] max-w-80 rounded-full bg-blue-400/10 blur-[clamp(40px,5vw,100px)]"></div>

      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-40 gap-8 md:grid-cols-40">
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-white" />
          ))}
        </div>
      </div>

      <div className="container mx-auto">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="w-full lg:w-1/2">
              <div className="relative mx-auto h-[300px] w-full max-w-[500px] overflow-hidden rounded-2xl sm:h-[350px] md:h-[400px]">
                <div className="absolute inset-0 -m-1 rounded-2xl bg-gradient-to-br from-purple-300/10 to-blue-300/10 backdrop-blur-[2px]"></div>
                <div className="absolute inset-1 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                  <img
                    src="/assets/partners/martin_talk.jpg"
                    alt="Industry collaboration"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-700/30 to-blue-700/40"></div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <h2 className="mb-8 text-3xl font-semibold">
                For <span className="text-purple-300">Companies</span>
              </h2>

              <div className="space-y-6">
                <p className="text-xl font-medium text-white">
                  Access pre-selected top AI talent, from ML Engineers to AI
                  Strategists.
                </p>

                <p className="text-xl font-medium text-white">
                  Partner with TUM.ai — host workshops, speak at events, or set
                  Hackathon challenges.
                </p>

                <p className="text-xl font-medium text-white">
                  Let student teams tackle your real-world AI projects
                  affordably and effectively.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button asChild variant="primary">
                    <a href="mailto:partners@tum-ai.com">
                      <span className="relative z-10">Become a Partner</span>
                    </a>
                  </Button>

                  <Button
                    asChild
                    className="rounded-md border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  >
                    <a href="/partners">View our Partners</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
