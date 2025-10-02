export default function Milestones() {
  return (
    <div className="flex flex-col gap-8 px-8 md:px-16">
      <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
        Our <span className="gradient-text"> Milestones </span>
      </h2>

      <div className="flex flex-col gap-8 max-w-[700px] mx-auto">
        {[
          {
            year: "2020",
            content: [
              "Official Accrediation as a Student Initiative at TUM",
              "Development of a first concept for the initiative at the BusinessPlan-Seminar at UnternehmerTUM",
              "First Application Phase",
            ],
          },
          {
            year: "2021",
            content: [
              "TUM.ai officially a non-profit organization",
              "Launch of the first TUM.ai Makeathon",
              "Launch of the first Industry Phase",
              "Launch of the first AI Academy",
              "First Participation in ETH AI Center Summit",
            ],
          },
          {
            year: "2022",
            content: [
              "First Start-Up tour in Berlin",
              "First AI Bootcamp in collaboration with KNUST",
              "Launch of the AI Entrepreneur-Lab 1.0",
            ],
          },
          {
            year: "2023",
            content: [
              "Launch of the AI.Summit (2-day conference)",
              "Speaker at the TUM Dies Academicus",
            ],
          },
          {
            year: "2024",
            content: [
              "Launch of the Impact Projects with 10 cooperation partners (MIT, Unite, MI4People, Allianz, IBM Research, Flower)",
              "First paper publications at NeurIPS '24",
              "Launch of new Taskforces (Med.ai, TUM.ai Build, TUM.ai Robotics)",
            ],
          },
          {
            year: "2025",
            content: [
              "First Smaller-sized Hackathon with Aleph Alpha",
              "Launch of TUM.ai Expansion Berlin",
              "First ever event together with OpenAI after their office launch in Munich (1200+ signups)",
              "ICML main track paper, ICLR publication",
              "Biggest Makeathon yet with 500+ registrations",
              "TUM.ai Hackathon Summer with AWS, Lovable, ElevenLabs, Google, Anthropic, etc.",
            ],
          },
        ].map((step, index, arr) => (
          <>
            <div
              key={step.year}
              className={`w-full border-1 rounded-xl shadow-lg p-8 flex flex-col items-start text-left`}
            >
              <h4 className="text-2xl font-bold mb-6 w-full">{step.year}</h4>
              <div className="flex flex-col gap-3 w-full">
                {step.content.map((item, itemIndex) => (
                  <p key={itemIndex} className="text-base pl-4 -indent-4">
                    • {item}
                  </p>
                ))}
              </div>
            </div>
            {index < arr.length - 1 && (
              <div
                className="flex justify-center items-center py-4 w-full"
                key={step.year + "-arrow"}
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 40 40">
                  <path
                    d="M20 8v24M20 32l-8-8M20 32l8-8"
                    strokeWidth="3"
                    stroke="#891fdb"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}
