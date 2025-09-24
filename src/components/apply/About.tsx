export default function About() {
  return (
    <div className="flex flex-col gap-8 p-8 md:p-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          We are <span className="gradient-text">TUM.ai</span>
        </h2>
        <p className="text-xl md:text-2xl animate-item pb-8">
          As a leading student initiative focused on AI, we bring together a
          diverse group of over 90 active members, each with technical skills
          and cultural backgrounds. Our community consists of passionate AI
          enthusiasts who are determined to make an impact on the AI landscape
          worldwide. The journey towards shaping the future of AI is open to
          everyone – including you!
        </p>
        <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          Mission and <span className="gradient-text">Vision</span>
        </h2>
        <p className="text-xl md:text-2xl animate-item">
          Our long-term vision and mission are the key components that drive us
          forward without losing our direction.
        </p>
        <p className="text-subtitle text-gray-700">
          <span className="font-semibold text-purple-600">Vision:</span> Foster
          the next generation of AI talent.
        </p>
        <p className="text-subtitle text-gray-700">
          <span className="font-semibold text-purple-600">Mission:</span> TUM.ai
          connects students and all relevant stakeholders to facilitate the
          application of AI across domains and drive positive social impact
          through interdisciplinary projects.
        </p>
        <div className="w-full items-center pt-12 md:max-h-2/3 flex">
          <img
            className="object-cover bg-gray-200 rounded-xl w-full h-auto"
            src="/assets/apply/new_section_photo_1.webp"
            alt="TUM.ai members"
          />
        </div>
      </div>
    </div>
  );
}
