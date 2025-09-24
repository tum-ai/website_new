interface Story {
  name: string;
  role: string;
  story: string;
  image: string;
}

interface MemberStoriesProps {
  stories: Story[];
}
export default function MemberStories({ stories }: MemberStoriesProps) {
  return (
    <div
      id="memberStories"
      className="flex bg-white flex-col gap-8 p-8 md:p-16"
    >
      <section className="container mx-auto py-16">
        <h3 className="text-title font-bold mb-4 text-purple-600">
          Member Stories
        </h3>
        <div className="grid gap-8 md:grid-cols-2">
          {stories.map((story) => (
            <div
              key={story.name}
              className="rounded-xl p-6 shadow-lg border-1 flex flex-col items-center bg-white"
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
              <p className="text-base text-gray-800 text-center">
                {story.story}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
