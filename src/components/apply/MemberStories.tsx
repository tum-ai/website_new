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
      className="flex bg-minimal-gray flex-col gap-8 p-8 pb-16 md:p-16"
    >
      <section className="container mx-auto px-8 md:px-0 max-w-4xl">
        <h1 className="text-title sm:text-2xl md:text-[2rem] text-primary mb-4 font-semibold animate-item">
              Member Stories
            </h1>
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
              <h3 className="text-subtitle font-bold mb-1 text-primary">
                {story.name}
              </h3>
              <p className="text-subtext text-center text-text-gray mb-2">
                {story.role}
              </p>
              <p className="text-base text-black text-center">
                {story.story}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
