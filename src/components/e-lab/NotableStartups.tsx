import Section from "../ui/Section";

{
  /* Notable Startups Section */
}
export const NotableStartups = () => {
  return (
    <Section className="py-12 sm:py-12 lg:py-16 bg-gray-50 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto text-center px-4">
        <p className={`text-sm text-gray-500 mb-8 uppercase tracking-wider`}>
          Notable AI E-Lab Startups from previous iterations
        </p>

        <div className="relative w-full overflow-hidden">
          <div className="group/marquee">
            <div className="flex animate-scroll-left items-center whitespace-nowrap gap-8 md:gap-12">
              {/* First set */}
              <div className="flex items-center gap-8 md:gap-12 flex-none">
                <a
                  href="https://tenmin.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-20 md:w-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/Tenmin.svg"
                    alt="Tenmin"
                    width={120}
                    height={48}
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://explaino.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-24 md:w-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/LogoExplaino.svg"
                    alt="Explaino"
                    width={160}
                    height={48}
                    className="h-6 md:h-8 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://www.spherecast.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-22 md:w-28 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/Spherecast.webp"
                    alt="Spherecast"
                    width={140}
                    height={48}
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://www.get-ikigai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-24 md:w-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/get-ilkigai.svg"
                    alt="Get Ikigai"
                    width={135}
                    height={25}
                    className="h-6 md:h-8 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://www.tau-robotics.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-auto flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <img
                      src="/assets/e-lab/startups/TauRobotics.svg"
                      alt="Tau Robotics"
                      width={40}
                      height={40}
                      className="h-8 md:h-10 w-auto object-contain mr-2 sm:mr-4"
                    />
                    <span
                      className={`text-sm md:text-base font-bold text-black `}
                    >
                      Tau Robotics
                    </span>
                  </div>
                </a>
                <a
                  href="https://www.helmit.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-22 md:w-28 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/helmit.svg"
                    alt="Helmit"
                    width={40}
                    height={40}
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                </a>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex space-x-8 md:space-x-12 items-center shrink-0">
                <a
                  href="https://tenmin.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-20 md:w-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/Tenmin.svg"
                    alt="Tenmin"
                    width={120}
                    height={48}
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://explaino.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-24 md:w-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/LogoExplaino.svg"
                    alt="Explaino"
                    width={160}
                    height={48}
                    className="h-6 md:h-8 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://www.spherecast.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-22 md:w-28 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/Spherecast.webp"
                    alt="Spherecast"
                    width={140}
                    height={48}
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://www.get-ikigai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-24 md:w-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/get-ilkigai.svg"
                    alt="Get Ikigai"
                    width={135}
                    height={25}
                    className="h-6 md:h-8 w-auto object-contain"
                  />
                </a>
                <a
                  href="https://www.tau-robotics.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-auto flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <img
                      src="/assets/e-lab/startups/TauRobotics.svg"
                      alt="Tau Robotics"
                      width={40}
                      height={40}
                      className="h-8 md:h-10 w-auto object-contain mr-2 sm:mr-4"
                    />
                    <span
                      className={`text-sm md:text-base font-bold text-black `}
                    >
                      Tau Robotics
                    </span>
                  </div>
                </a>
                <a
                  href="https://www.helmit.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 md:h-12 w-22 md:w-28 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img
                    src="/assets/e-lab/startups/helmit.svg"
                    alt="Helmit"
                    width={40}
                    height={40}
                    className="h-8 md:h-10 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
