import { useEffect, useRef, useState } from "react";

export const Timeline = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const timelineTop = rect.top;
        const timelineHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Calculate progress based on how much of the timeline is visible
        const visibleTop = Math.max(0, windowHeight - timelineTop);
        const visibleHeight = Math.min(visibleTop, timelineHeight);
        const progress = Math.min(
          1,
          Math.max(0, visibleHeight / timelineHeight),
        );

        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const timelineItems = [
    { title: "Start", description: "October", side: "right" },
    {
      title: "Onboarding Weekend",
      description: "3 days intensive",
      side: "left",
    },
    { title: "Education Sessions", description: "Learning", side: "right" },
    { title: "Build & Iterate I", description: "4 weeks", side: "left" },
    {
      title: "Midterm-Pitch",
      description: "Initial Feedback",
      side: "right",
    },
    { title: "Build & Iterate II", description: "6 weeks", side: "left" },
    {
      title: "Pre-Demo Day Pitch",
      description: "The Final Test",
      side: "right",
    },
    { title: "Demo Day", description: "January", side: "left" },
  ];
  return (
    <section className="flex flex-col items-center justify-center py-12 sm:py-12 lg:py-16 bg-white w-full">
      <h2
        className={`text-3xl md:text-4xl tracking-tight font-normal mb-8 text-black text-center uppercase `}
      >
        Program
      </h2>
      <div ref={timelineRef} className="relative max-w-4xl mx-auto w-full">
        {/* Vertical line with gradient animation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-300 rounded-full">
          <div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-purple-600 to-purple-400 rounded-full transition-all duration-300 ease-out"
            style={{
              height: `${scrollProgress * 100}%`,
              boxShadow:
                scrollProgress > 0
                  ? "0 0 20px rgba(168, 85, 247, 0.5)"
                  : "none",
            }}
          />
        </div>

        {/* Timeline items */}
        <div className="relative space-y-16">
          {timelineItems.map((item, index) => {
            const itemProgress = Math.max(
              0,
              Math.min(1, scrollProgress * timelineItems.length - index),
            );
            const isActive = itemProgress > 0;

            return (
              <div key={index} className="flex items-center relative">
                {item.side === "left" ? (
                  <>
                    <div className="w-1/2 pr-12 text-right">
                      <div
                        className={`transition-all duration-500 ${isActive ? "translate-x-0 opacity-100" : "translate-x-8 opacity-60"}`}
                      >
                        <h3
                          className={`font-semibold text-xl mb-2 transition-colors duration-300 ${isActive ? "text-purple-700" : "text-gray-800"}`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-sm transition-colors duration-300 ${isActive ? "text-purple-600" : "text-gray-600"}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full border-4 transition-all duration-300 ${isActive
                            ? "bg-purple-600 border-purple-300 shadow-lg shadow-purple-300/50 scale-110"
                            : "bg-white border-gray-400 scale-100"
                          }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-30" />
                        )}
                      </div>
                    </div>
                    <div className="w-1/2"></div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full border-4 transition-all duration-300 ${isActive
                            ? "bg-purple-600 border-purple-300 shadow-lg shadow-purple-300/50 scale-110"
                            : "bg-white border-gray-400 scale-100"
                          }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-30" />
                        )}
                      </div>
                    </div>
                    <div className="w-1/2 pl-12">
                      <div
                        className={`transition-all duration-500 ${isActive ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-60"}`}
                      >
                        <h3
                          className={`font-semibold text-xl mb-2 transition-colors duration-300 ${isActive ? "text-purple-700" : "text-gray-800"}`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-sm transition-colors duration-300 ${isActive ? "text-purple-600" : "text-gray-600"}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Subtitle */}
      <div className="text-center mt-12">
        <p className={`text-base text-gray-700 font-medium`}>
          Your journey continues...
        </p>
      </div>
    </section>
  );
};
