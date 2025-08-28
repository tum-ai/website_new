import FAQ from "@/components/ui/FAQ";
import { faqs } from "@/data/qanda";

export default function QandA() {
  return (
    <main>
      <div className="relative bg-gradient-to-br from-blue-900 to-purple-900 py-32 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-5xl font-bold md:text-6xl">
            Frequently Asked <span className="text-purple-400">Questions</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Find answers to common questions about TUM.ai.
          </p>
        </div>
      </div>
      <FAQ faq={faqs} />
    </main>
  );
}
