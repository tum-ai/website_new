import SEO from "@/components/SEO";
import FAQ from "@/components/ui/FAQ";
import { getSEOConfig } from "@/config/seo";
import { faqs } from "@/data/qanda";

export default function QandA() {
  return (
    <>
      <SEO {...getSEOConfig("qanda")} />
      <main>
        <div className="flex flex-col min-h-screen">
          <div className="brand-accent-shell relative py-32 text-white">
            <div className="container mx-auto max-w-4xl px-4 text-center">
              <h1 className="text-4xl font-bold mt-8 md:text-5xl">
                Frequently Asked
                <b className="brand-highlight-text font-semibold"> Questions</b>
              </h1>
              <p className="mt-4 text-lg text-lavender-tint">
                Find answers to common questions about TUM.ai.
              </p>
            </div>
          </div>
          <FAQ faq={faqs} />
        </div>
      </main>
    </>
  );
}
