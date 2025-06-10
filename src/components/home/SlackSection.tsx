import { faSlack } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export const SlackSection = () => {
  return (
    <section className="relative overflow-hidden p-8 sm:py-16 lg:py-24">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40"></div>

      {/* Mesh grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

      <div className="container mx-auto">
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center">
            {/* Main card */}
            <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-white/80 to-white/40 shadow-xl backdrop-blur-sm">
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>

              {/* Top highlight */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>

              {/* Left highlight */}
              <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/80 to-transparent"></div>

              <div className="relative px-8 py-14 md:px-14">
                <div className="text-center">
                  <h2 className="mb-6 bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-4xl font-bold text-transparent">
                    Join our Community
                  </h2>

                  <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-600">
                    Be among the first to be informed about upcoming events, job
                    opportunities, and workshops in our vibrant AI community.
                  </p>

                  <div className="relative">
                    <a
                      href="https://join.slack.com/t/tumaipublic/shared_invite/zt-10kg0t1f9-JLRXDxY_d_vprKWgab0cVw"
                      className="group relative flex items-center gap-3 overflow-hidden rounded-xl px-8 py-4 font-medium text-white"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 group-hover:scale-105"></span>
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_50%)] opacity-0 transition-opacity duration-300 group-hover:opacity-20"></span>
                      <span className="absolute inset-0 rounded-xl border border-white/20"></span>
                      <span className="relative flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faSlack}
                          className="text-white/90"
                          size="xl"
                        />
                        <span>Join TUM.ai Public Slack</span>
                        <svg
                          className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </span>
                    </a>

                    {/* Button shadow/glow */}
                    <div className="absolute -inset-1 -z-10 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 opacity-70 blur-xl"></div>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-1 text-sm text-slate-500">
                    <span className="opacity-70">
                      By joining, you agree to our
                    </span>
                    <a
                      className="font-medium text-purple-600 transition-colors hover:text-purple-700 hover:underline"
                      href="/data-privacy"
                    >
                      Terms & Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
