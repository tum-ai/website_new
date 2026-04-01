import { useState } from "react";

interface Faq {
  question: string;
  answer: string;
}

interface FaqProps {
  faq: Faq[];
}

export default function FAQ({ faq }: FaqProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-minimal-gray">
      <div className="container mx-auto p-8 pb-16">
        <div className="space-y-6">
          {faq.map((faqItem, index) => (
            <div key={index} className="border-b-2 border-gray-300 pb-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === index ? null : index)
                }
              >
                <p
                  className={`text-lg font-semibold ${openFaqIndex === index ? "text-primary" : "text-text-gray"}`}
                >
                  {faqItem.question}
                </p>
                <svg
                  className={`w-6 h-6 text-primary transition-transform ${openFaqIndex === index ? "transform rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
              {openFaqIndex === index && (
                <div className="mt-4 text-gray-700">
                  <p>{faqItem.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}