interface Story {
  name: string;
  role: string;
  story: string;
  image: string;
}

interface MemberStoriesProps {
  stories: Story[];
}
// shared for now, can be customized for each city
export default function MemberStories({ stories }: MemberStoriesProps) {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-16">
      <h3 className="text-title text-white font-bold mb-4">
        Member <span className="text-purple-600">Stories</span>
      </h3>
      <div className="grid gap-8 md:grid-cols-2">
        {stories.map((story) => (
          <div
            key={story.name}
            className="rounded-xl  p-6 shadow-lg flex flex-col items-center bg-white"
          >
            <img
              src={story.image}
              alt={story.name}
              className="mb-4 h-32 w-32 rounded-full object-cover"
            />
            <h3 className="text-subtitle font-bold text-purple-800">
              {story.name}
            </h3>
            <p className="text-subtext text-gray-600 mb-2">{story.role}</p>
            <p className="text-base text-gray-800 text-center">{story.story}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
