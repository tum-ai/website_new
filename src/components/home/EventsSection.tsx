import EventCard from "./EventCard";

const EventsSection = () => {
  const data = [
    {
      img: "/assets/martin_talk.jpg",
      title: "TUM.ai Onboarding WS25/26",
      date: {
        day: "Sunday",
        date: "17 October, 2025",
      },
    },
    {
      img: "/assets/martin_talk.jpg",
      title: "TUM.ai Onboarding WS25/26",
      date: {
        day: "Sunday",
        date: "17 October, 2025",
      },
    },
    {
      img: "/assets/martin_talk.jpg",
      title: "TUM.ai Onboarding WS25/26",
      date: {
        day: "Sunday",
        date: "17 October, 2025",
      },
    },
  ];
  return (
    <div className="flex flex-col gap-8 items-center justify-center px-10 mt-4 mb-10">
      <h1 className="text-3xl md:text-4xl font-bold">Our Events</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {data.map((item, idx) => (
          <div className="flex gap-2 flex-col">
            <EventCard key={idx} {...item} />
            <h1 className="!text-xl font-bold">Past Event</h1>{" "}
          </div>
        ))}
        {/* this should be rendered automatically */}
      </div>
    </div>
  );
};

export default EventsSection;
