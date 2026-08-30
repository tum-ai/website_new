type StartupLogo = {
  href: string;
  src: string;
  alt: string;
  widthClass: string;
  imageClass: string;
  label?: string;
};

const startupLogos: StartupLogo[] = [
  {
    href: "https://tenmin.ai/",
    src: "/assets/e-lab/startups/Tenmin.svg",
    alt: "Tenmin",
    widthClass: "w-20 md:w-24",
    imageClass: "h-8 md:h-10",
  },
  {
    href: "https://explaino.ai/",
    src: "/assets/e-lab/startups/LogoExplaino.svg",
    alt: "Explaino",
    widthClass: "w-24 md:w-32",
    imageClass: "h-6 md:h-8",
  },
  {
    href: "https://www.spherecast.ai/",
    src: "/assets/e-lab/startups/Spherecast.webp",
    alt: "Spherecast",
    widthClass: "w-22 md:w-28",
    imageClass: "h-8 md:h-10",
  },
  {
    href: "https://www.get-ikigai.com/",
    src: "/assets/e-lab/startups/get-ilkigai.svg",
    alt: "Get Ikigai",
    widthClass: "w-24 md:w-32",
    imageClass: "h-6 md:h-8",
  },
  {
    href: "https://www.tau-robotics.com/",
    src: "/assets/e-lab/startups/TauRobotics.svg",
    alt: "Tau Robotics",
    widthClass: "w-auto",
    imageClass: "h-8 md:h-10",
    label: "Tau Robotics",
  },
  {
    href: "https://www.helmit.org/",
    src: "/assets/e-lab/startups/helmit.svg",
    alt: "Helmit",
    widthClass: "w-22 md:w-28",
    imageClass: "h-8 md:h-10",
  },
];

function StartupLogo({ logo }: { logo: StartupLogo }) {
  return (
    <a
      href={logo.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${logo.widthClass} flex h-10 items-center justify-center grayscale transition-all duration-300 hover:grayscale-0 md:h-12`}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        width={160}
        height={48}
        className={`${logo.imageClass} w-auto object-contain ${logo.label ? "mr-2 sm:mr-4" : ""}`}
      />
      {logo.label && (
        <span className="font-bold text-black text-sm md:text-base">
          {logo.label}
        </span>
      )}
    </a>
  );
}

export const NotableStartups = () => {
  const marqueeLogos = [...startupLogos, ...startupLogos];

  return (
    <section className="w-full overflow-hidden bg-minimal-gray py-12 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="mb-10 text-text-gray text-sm tracking-wider">
          Notable E-Lab Startups from previous iterations
        </p>

        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll-left items-center gap-8 whitespace-nowrap md:gap-12">
            {marqueeLogos.map((logo, index) => (
              <StartupLogo key={`${logo.alt}-${index}`} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
