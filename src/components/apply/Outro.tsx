import FAQ from "@/components/ui/FAQ";
import { faq } from "@/data/apply/faq";
export default function Outro() {
  return (
    <>
      <div className="flex flex-col gap-4 px-8 md:px-16 pt-8">
        <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          Apply now and join <span className="gradient-text">TUM.ai</span>
        </h2>
        <p className="text-xl md:text-2xl animate-item">
          Together, we shape the AI ecosystem by making AI accessible to
          everyone in the future. We are excited to have you on board.
        </p>
      </div>
      <div className="md:px-8">
        <FAQ faq={faq} />
      </div>
    </>
  );
}
