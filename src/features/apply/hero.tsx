import Image from "next/image";
import { Highlight, PageHero } from "@/components/ds";
import { ApplyAction } from "./apply-action";

export function Hero() {
  return (
    <PageHero
      titleId="apply-hero-title"
      title={
        <>
          <Highlight>Join</Highlight> Us
        </>
      }
      lead={
        <>
          <p className="text-fg text-heading-md md:text-heading-lg">
            Are you a young innovator passionate about making a difference?
          </p>
          <p className="mt-6">
            We're here to bridge the gap by connecting you with key stakeholders
            in your field. Together, we can harness the power of AI for
            transformative, interdisciplinary projects that drive tangible
            social change.
          </p>
        </>
      }
      actions={<ApplyAction statusId="apply-hero-status" />}
      media={
        <div className="hidden md:flex md:justify-center lg:justify-end lg:pb-3">
          <Image
            src="/assets/tum_ai_logo_new.svg"
            alt="TUM.ai Logo"
            width={1640}
            height={406}
            loading="eager"
            className="h-auto w-full max-w-md lg:max-w-lg"
          />
        </div>
      }
    />
  );
}
