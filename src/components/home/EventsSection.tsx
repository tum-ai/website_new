import type { Event } from "@/lib/types";
import { useEffect, useState } from "react";
import EventCard from "./EventCard";

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/getNotes`,
        ); // change this once deployed to /api/getNotes
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Could not load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const currentDate = new Date();
  const pastEvents = events
    .filter((event) => new Date(event.event_date) < currentDate)
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    )
    .map((event) => ({
      img: event.images![0] || "",
      title: event.title,
      date: {
        day: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
          new Date(event.event_date),
        ),
        date: new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(event.event_date)),
      },
    }));

  if (loading) return <div>Loading events...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="flex flex-col gap-8 items-center justify-center px-10 mt-4 mb-10">
      <h1 className="text-3xl md:text-4xl font-bold">Our Events</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {pastEvents.map((item, idx) => (
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
