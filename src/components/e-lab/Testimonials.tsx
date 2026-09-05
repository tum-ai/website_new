import Image from "next/image";

import {
  type TestimonialCard,
  testimonialCards,
} from "@/data/e-lab/venture-page";

function CommunityQuote({ testimonial }: { testimonial: TestimonialCard }) {
  return (
    <article className="flex h-[22rem] w-72 shrink-0 flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:w-80">
      <div className="mb-4 flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
          <Image
            src={testimonial.portraitSrc}
            alt={testimonial.portraitAlt}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-black">
            {testimonial.name}
          </h3>
          <p className="text-sm leading-5 text-text-gray">{testimonial.role}</p>
          {testimonial.context ? (
            <p className="text-xs font-medium text-primary">
              {testimonial.context}
            </p>
          ) : null}
        </div>
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed text-gray-700">
        “{testimonial.quote}”
      </blockquote>
      <div className="mt-4 flex items-center gap-3 border-gray-100 border-t pt-4">
        <div className="relative h-8 w-16 shrink-0">
          <Image
            src={testimonial.organizationLogoSrc}
            alt={testimonial.organizationLogoAlt}
            fill
            sizes="64px"
            className="object-contain object-left"
          />
        </div>
        <span className="text-xs text-gray-500">
          {testimonial.organizationLabel}
        </span>
      </div>
    </article>
  );
}

function QuoteSet({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className={
        "flex shrink-0 gap-6 pr-6" + (duplicate ? " marquee-copy" : "")
      }
      aria-hidden={duplicate || undefined}
    >
      {testimonialCards.map((testimonial) => (
        <CommunityQuote
          key={(duplicate ? "duplicate-" : "") + testimonial.id}
          testimonial={testimonial}
        />
      ))}
    </div>
  );
}

export const Testimonials = () => {
  return (
    <section className="flex w-full flex-col items-center justify-center bg-minimal-gray py-12 lg:py-16">
      <h2 className="mb-4 text-center text-title font-semibold tracking-tight text-black sm:text-2xl md:text-[2rem]">
        Our Community
      </h2>
      <p className="mt-4 mb-10 text-center text-base text-text-gray">
        Hear more from voices from our network
      </p>

      <div className="marquee-viewport relative w-full overflow-hidden py-4">
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 bg-gradient-to-r from-minimal-gray via-minimal-gray-50/70 to-transparent sm:w-40 lg:w-56" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-gradient-to-l from-minimal-gray via-minimal-gray-50/70 to-transparent sm:w-40 lg:w-56" />
        <div className="animate-scroll-left flex w-max pl-4">
          <QuoteSet />
          <QuoteSet duplicate />
        </div>
      </div>
    </section>
  );
};
