import { Link } from "react-router-dom";
import Section from "./ui/Section";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-purple-950 to-purple-900">
      <div className="bg-grid-white/[0.02] absolute inset-0 [mask-image:radial-gradient(white,transparent_85%)]" />

      <Section className="relative">
        <div className="container px-16 py-16">
          <div className="flex md:flex-row md:items-center md:justify-between">
            <div className="mb-8 md:mb-0">
              <img
                src={"/assets/logo_new_white_standard.png"}
                className="mb-6 flex text-2xl transition-all duration-300 hover:opacity-90"
                alt="Logo"
                width="128"
                height="32"
              />

              <p className="mb-6 max-w-md text-sm text-white/60">
                Building the next generation of AI leaders and innovators
                through community, education, and real-world projects.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:grid-cols-4 sm:gap-x-16 md:gap-x-8">
              <div className="col-span-1">
                <p className="mb-3 text-xs font-medium tracking-wider text-white/50 uppercase">
                  Connect
                </p>

                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://de.linkedin.com/company/tum-ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      aria-label="LinkedIn"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/tum.ai_official/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      aria-label="Instagram"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://join.slack.com/t/tumaipublic/shared_invite/zt-10kg0t1f9-JLRXDxY_d_vprKWgab0cVw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      aria-label="Slack"
                    >
                      Slack
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:contact@tum-ai.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      aria-label="Email"
                    >
                      Email
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-span-1">
                <p className="mb-3 text-xs font-medium tracking-wider text-white/50 uppercase">
                  Legal
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      to="/imprint"
                    >
                      Imprint
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      to="/data-privacy"
                    >
                      Data Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      to="/disclaimer"
                    >
                      Disclaimer
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-1">
                <p className="mb-3 text-xs font-medium tracking-wider text-white/50 uppercase">
                  Contribute
                </p>
                <ul className="space-y-2">
                  <li>
                    <a
                      className="text-sm text-white/80 transition-colors duration-300 hover:text-purple-300"
                      href="https://github.com/tum-ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-sm text-white/40">
              TUM.ai - Student Initiative at Technical University of Munich
            </p>
          </div>
        </div>
      </Section>
    </footer>
  );
}
