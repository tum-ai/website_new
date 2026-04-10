import FAQ from "@/components/ui/FAQ";
import { faq } from "@/data/apply/faq";
export default function Outro() {
  return (
    <>
      <div className="flex flex-col gap-4 px-8 pt-8 pb-8 md:px-16 md:pt-16">
        <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          Apply now and join <span className="gradient-text">TUM.ai</span>!
        </h2>
        <p className="text-xl mb-4 md:text-2xl animate-item">
          Together, we shape the AI ecosystem by making AI accessible to
          everyone in the future. We are excited to have you on board.
        </p>
      </div>

      {/* BREAKOUT: 
          so that minimal-gray has no white borders left and right
      */}
      <div className="bg-minimal-gray w-[100vw] ml-[calc(-50vw+50%)]">
        <FAQ faq={faq} className="px-8 py-16 md:px-16" />
      </div>
    </>
  );
}
