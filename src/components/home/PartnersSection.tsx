import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export const PartnersSection = () => {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-10 md:flex-row md:px-10 md:py-15">
      <div className="w-full md:w-4/7">
        <Image
          className="h-auto w-full rounded-xl object-cover"
          src="/assets/partners_pic.webp"
          alt="Partners"
          width={1600}
          height={1067}
          sizes="(min-width: 768px) 57vw, 100vw"
        />
      </div>

      <div className="flex w-full flex-col justify-end gap-4 text-center motion-safe:animate-fade-in md:w-3/7 md:text-left">
        <h1 className="text-title font-semibold sm:text-2xl md:text-[2rem]">
          Join <span className="gradient-text">TUM.ai</span> as a sponsor or
          cooperation partner.
        </h1>
        <p className="text-base sm:text-lg md:text-[1.5rem]">
          Get access to our exclusive pre-selected talent pool of qualified
          Software/Data Engineers and AI Strategists.
        </p>
        <div className="mt-4 flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4 md:justify-start">
          <Button
            asChild
            variant="primary"
            className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
          >
            <a href="mailto:partners@tum-ai.com">Become a Partner</a>
          </Button>

          <Button
            asChild
            variant="outline2"
            className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
          >
            <Link href="/partners" className="w-full">
              View Our Partners
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
