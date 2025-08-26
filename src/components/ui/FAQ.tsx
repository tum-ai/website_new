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
    <section className="container mx-auto max-w-4xl px-2 py-16">
      <h3 className="text-3xl md:text-4xl font-bold mb-4">
        <span className="flex items-center text-purple-600">
          Frequently Asked Questions
        </span>
      </h3>
      <div className="space-y-6">
        {faq.map((faq, index) => (
          <div key={index} className="border-b-2 border-gray-300 pb-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setOpenFaqIndex(openFaqIndex === index ? null : index)
              }
            >
              <p
                className={`text-lg font-semibold ${openFaqIndex === index ? "text-purple-700" : "text-gray-800"}`}
              >
                {faq.question}
              </p>
              <svg
                className={`w-6 h-6 text-purple-600 transition-transform ${openFaqIndex === index ? "transform rotate-180" : ""}`}
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
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
