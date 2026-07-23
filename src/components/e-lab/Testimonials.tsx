type CommunityCard = {
  name: string;
  role: string;
  cohort: string;
  quote: string;
  imageSrc: string;
  partner: string;
  partnerLabel: string;
};

const communityCards: CommunityCard[] = [
  {
    name: "Leon Hergert",
    role: "Co-Founder @ Spherecast",
    cohort: "E-Lab 1.0",
    quote:
      "The E-Lab gave us the foundation to build Spherecast from idea to YC. The community and mentorship were game-changing.",
    imageSrc: "/assets/e-lab/testimonials/leon_hergert.png",
    partner: "YC",
    partnerLabel: "Y Combinator S24",
  },
  {
    name: "Benedikt Wieser",
    role: "Winner E-Lab 2.0",
    cohort: "E-Lab 2.0",
    quote:
      "The E-Lab is probably the best program for creating top-end entrepreneurs out there. It's simply incredible.",
    imageSrc: "/assets/e-lab/testimonials/benedikt_wieser.png",
    partner: "CDTM",
    partnerLabel: "CDTM Alumni",
  },
  {
    name: "Leonardo Benini",
    role: "Founder @ Stealth Startup",
    cohort: "E-Lab 3.0",
    quote:
      "Structured, fast, and insanely effective. Every founder should experience this.",
    imageSrc: "/assets/e-lab/testimonials/leonardo_benini.png",
    partner: "EWOR",
    partnerLabel: "EWOR Fellow",
  },
  {
    name: "Oliver Schoppe",
    role: "Principal @ UVC Partners",
    cohort: "Mentor & Investor",
    quote:
      "The quality of founders coming out of E-Lab is exceptional. We're proud to be part of this community.",
    imageSrc: "/assets/e-lab/testimonials/oliver_schoppe.png",
    partner: "UVC",
    partnerLabel: "UVC Partners",
  },
  {
    name: "Viktor Shen",
    role: "Founder of Tenmin",
    cohort: "E-Lab 3.0",
    quote:
      "We went from zero to being a funded startup - the E-Lab accelerated our journey far beyond what we thought was possible.",
    imageSrc: "/assets/e-lab/testimonials/viktor_shen.jpeg",
    partner: "10M",
    partnerLabel: "Tenmin AI",
  },
];

function CommunityCard({ card }: { card: CommunityCard }) {
  return (
    <div className="flex h-72 w-80 flex-shrink-0 flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <div className="mb-4 flex items-start gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
          <img
            src={card.imageSrc}
            alt={card.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-black">
            {card.name}
          </h3>
          <p className="truncate text-sm text-text-gray">{card.role}</p>
          <p className="text-xs font-medium text-primary">{card.cohort}</p>
        </div>
      </div>
      <p className="flex-1 overflow-hidden text-sm leading-relaxed text-gray-700">
        "{card.quote}"
      </p>
      <div className="mt-4 flex items-center gap-3 border-gray-100 border-t pt-4">
        <div className="flex h-8 min-w-8 items-center justify-center rounded-sm bg-lavender-tint px-2 text-[10px] font-bold text-dark-purple">
          {card.partner}
        </div>
        <span className="text-gray-500 text-xs">{card.partnerLabel}</span>
      </div>
    </div>
  );
}

export const Testimonials = () => {
  const marqueeCards = [...communityCards, ...communityCards];

  return (
    <section className="flex w-full flex-col items-center justify-center bg-minimal-gray py-12 sm:py-12 lg:py-16">
      <h2 className="mb-4 text-center font-semibold text-black text-title tracking-tight sm:text-2xl md:text-[2rem]">
        Our Community
      </h2>
      <p className="mt-4 mb-10 text-center text-base text-text-gray">
        Hear more from voices from our network
      </p>

      <div className="relative w-full overflow-hidden py-4">
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-32 bg-gradient-to-r from-minimal-gray via-minimal-gray-50/70 to-transparent sm:w-40 md:w-48 lg:w-56 xl:w-64" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-32 bg-gradient-to-l from-minimal-gray via-minimal-gray-50/70 to-transparent sm:w-40 md:w-48 lg:w-56 xl:w-64" />
        <div className="flex animate-scroll-left space-x-6 px-4">
          {marqueeCards.map((card, index) => (
            <CommunityCard key={`${card.name}-${index}`} card={card} />
          ))}
        </div>
        <div className="mb-4" />
      </div>
    </section>
  );
};
