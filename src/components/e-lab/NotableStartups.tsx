import Image from "next/image";

import {
  type NotableStartup,
  notableStartups,
} from "@/data/e-lab/venture-page";

function StartupMark({
  startup,
  duplicate,
}: {
  startup: NotableStartup;
  duplicate: boolean;
}) {
  return (
    <a
      href={startup.href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={duplicate ? -1 : undefined}
      className={
        "flex h-12 shrink-0 items-center justify-center grayscale transition-all duration-300 hover:grayscale-0 focus-visible:grayscale-0 " +
        (startup.wordmarkLabel ? "w-52" : "w-40")
      }
      aria-label={duplicate ? undefined : "Visit " + startup.name}
    >
      <span className="flex items-center justify-center gap-3">
        <span className="relative block h-10 w-24">
          <Image
            src={startup.logoSrc}
            alt={startup.logoAlt}
            fill
            sizes="96px"
            className="object-contain"
          />
        </span>
        {startup.wordmarkLabel ? (
          <span className="text-sm font-bold text-black md:text-base">
            {startup.wordmarkLabel}
          </span>
        ) : null}
      </span>
    </a>
  );
}

function StartupSet({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className={
        "flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12" +
        (duplicate ? " marquee-copy" : "")
      }
      aria-hidden={duplicate || undefined}
    >
      {notableStartups.map((startup) => (
        <StartupMark
          key={(duplicate ? "duplicate-" : "") + startup.id}
          startup={startup}
          duplicate={duplicate}
        />
      ))}
    </div>
  );
}

export const NotableStartups = () => {
  return (
    <section className="w-full overflow-hidden bg-minimal-gray py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="mb-10 text-sm tracking-wider text-text-gray">
          Notable E-Lab Startups from previous iterations
        </p>

        <div className="marquee-viewport relative w-full overflow-hidden">
          <div className="animate-scroll-left flex w-max items-center">
            <StartupSet />
            <StartupSet duplicate />
          </div>
        </div>
      </div>
    </section>
  );
};
