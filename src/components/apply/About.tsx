export default function About() {
  return (
    <section className="container mx-auto max-w-4xl px-2 py-16">
      {/* We are TUM.ai */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          We are <span className="text-purple-600">TUM.ai</span>
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          As a leading student initiative focused on AI, we bring together a
          diverse group of over 100 active members, each with technical skills
          and cultural backgrounds. Our community consists of passionate AI
          enthusiasts who are determined to make an impact on the AI landscape
          worldwide. The journey towards shaping the future of AI is open to
          everyone – including you!
        </p>
      </div>

      {/* Mission and Vision */}
      <div className="mb-8">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Mission and <span className="text-purple-600">Vision</span>
        </h3>
        <p className="text-lg text-gray-700 mb-4">
          Our long-term vision and mission are the key components that drive us
          forward without losing our direction.
        </p>
        <div className="space-y-2">
          <p className="text-lg text-gray-700">
            <span className="font-semibold text-purple-600">Vision | </span>
            Foster the next generation of AI talent.
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold text-purple-600">Mission | </span>
            TUM.ai connects students and all relevant stakeholders to facilitate
            the application of AI across domains and drive positive social
            impact through interdisciplinary projects.
          </p>
        </div>
      </div>
    </section>
  );
}
