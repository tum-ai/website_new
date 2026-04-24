import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";

export const Hero = () => {
  return (
    <div className="flex flex-col items-start justify-center px-4 py-6 sm:justify-end sm:px-8 sm:py-12">
      <Image
        src="/assets/tum_ai_logo_new.svg"
        alt="TUM.ai New Logo"
        className="mb-4 ml-1 h-auto w-[220px]"
        width={220}
        height={40}
        sizes="220px"
        priority
      />

      <p className="mt-2 mb-2 w-full font-thin leading-snug text-title sm:max-w-8/12 sm:text-4xl">
        Germany’s leading student initiative focused on
        <b className="brand-highlight-text font-medium">
          {" "}
          Artificial Intelligence.
        </b>
      </p>

      <div className="mt-4 flex w-full flex-col justify-start gap-3 sm:flex-row sm:gap-4">
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
          <Link href="/apply" className="w-full">
            Become a Member
          </Link>
        </Button>
      </div>
    </div>
  );
};
