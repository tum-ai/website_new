export default function Milestones() {
    return (
        <section className="container mx-auto max-w-4xl px-2 py-16">
            <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    Our <span className="text-purple-600">Milestones</span>
                </h3>

                {/* Roadmap */}
                <div className="mt-8">
                    <div className="flex flex-col gap-10 max-w-[700px] mx-auto">
                        {[
                            {
                                year: "2020",
                                content: [
                                    "Official Accrediation as a Student Initiative at TUM",
                                    "Development of a first concept for the initiative at the BusinessPlan-Seminar at UnternehmerTUM",
                                    "First Application Phase"
                                ],
                                gradient: "bg-gradient-to-b from-[#1A1147] via-[#2D1B6B] to-[#44337A]",
                                arrow: "#44337A"
                            },
                            {
                                year: "2021",
                                content: [
                                    "TUM.ai officially a non-profit organization",
                                    "Launch of the first TUM.ai Makeathon",
                                    "Launch of the first Industry Phase",
                                    "Launch of the first AI Academy",
                                    "First Participation in ETH AI Center Summit"
                                ],
                                gradient: "bg-gradient-to-b from-[#1E1454] via-[#321E75] to-[#483285]",
                                arrow: "#483285"
                            },
                            {
                                year: "2022",
                                content: [
                                    "First Start-Up tour in Berlin",
                                    "First AI Bootcamp in collaboration with KNUST",
                                    "Launch of the AI Entrepreneur-Lab 1.0"
                                ],
                                gradient: "bg-gradient-to-b from-[#221761] via-[#37217F] to-[#4C3190]",
                                arrow: "#4C3190"
                            },
                            {
                                year: "2023",
                                content: [
                                    "Launch of the AI.Summit (2-day conference)",
                                    "Speaker at the TUM Dies Academicus"
                                ],
                                gradient: "bg-gradient-to-b from-[#261A6E] via-[#3C2489] to-[#50349B]",
                                arrow: "#50349B"
                            },
                            {
                                year: "2024",
                                content: [
                                    "Launch of the Impact Projects with 10 cooperation partners (MIT, Unite, MI4People, Allianz, IBM Research, Flower)",
                                    "First paper publications at NeurIPS '24",
                                    "Launch of new Taskforces (Med.ai, TUM.ai Build, TUM.ai Robotics)"
                                ],
                                gradient: "bg-gradient-to-b from-[#2A1D7B] via-[#412793] to-[#5437A6]",
                                arrow: "#5437A6"
                            },
                            {
                                year: "2025",
                                content: [
                                    "First Smaller-sized Hackathon with Aleph Alpha",
                                    "Launch of TUM.ai Expansion Berlin"
                                ],
                                gradient: "bg-gradient-to-b from-[#2E2088] via-[#462A9D] to-[#583AB1]",
                                arrow: "#583AB1"
                            }
                        ].map((step, index, arr) => (
                            <>
                                <div
                                    key={step.year}
                                    className={`min-h-[250px] w-full rounded-xl shadow-lg p-8 flex flex-col items-start text-left text-white ${step.gradient}`}
                                >
                                    <h4 className="text-2xl font-bold mb-6 w-full">{step.year}</h4>
                                    <div className="flex flex-col gap-3 w-full">
                                        {step.content.map((item, itemIndex) => (
                                            <p key={itemIndex} className="text-base pl-4 -indent-4">• {item}</p>
                                        ))}
                                    </div>
                                </div>
                                {index < arr.length - 1 && (
                                    <div className="flex justify-center items-center py-4 w-full" key={step.year + "-arrow"}>
                                        <svg
                                            className="w-10 h-10"
                                            fill="none"
                                            viewBox="0 0 40 40"
                                        >
                                            <path
                                                d="M20 8v24M20 32l-8-8M20 32l8-8"
                                                stroke={arr[index + 1].arrow}
                                                strokeWidth="3"
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
            </div>
        </section>
    )
} 