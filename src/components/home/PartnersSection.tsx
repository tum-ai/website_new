import { Button } from "../ui/button";

export const PartnersSection = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8 px-6 md:px-10 py-10 md:py-15">
      {/* Left image */}
      <div className="md:w-4/7 w-full">
        <img
          className="rounded-xl w-full h-auto object-cover"
          src="/assets/partners_pic.jpg"
          alt="Partners"
        />
      </div>

      {/* Right content */}
      <div className="flex flex-col gap-4 md:w-3/7 w-full justify-end text-center md:text-left">
        <h1 className="text-title sm:text-2xl md:text-[2rem] font-semibold">
          Join{" "}
          <span className="bg-gradient-to-r from-[#6517A1] to-[#B57CFF] bg-clip-text text-transparent">
            TUM.ai
          </span>{" "}
          as a sponsor or cooperation partner.
        </h1>
        <p className="text-base sm:text-lg md:text-[1.5rem]">
          Get access to our exclusive pre-selected talent pool of qualified
          Software/Data Engineers and AI Strategists.
        </p>
        <div className="mt-4 flex flex-col gap-3 w-full sm:flex-row sm:gap-4 justify-start">
          <Button
            asChild
            variant="primary"
            className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
          >
            <a href="mailto:partners@tum-ai.com">Become a Partner</a>
          </Button>

          <Button asChild>
            <a
              href="/partners"
              className="w-full bg-black border border-[#A144E9] rounded-md px-6 py-3 text-[#A144E9] text-center sm:w-auto"
            >
              View Our Partners
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
