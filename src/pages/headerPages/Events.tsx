import EventCard from "@/components/events/EventsCard";
import { useEffect, useState } from "react";

type EventData = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export default function Events() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/getNotes"); // change this once deployed to /api/getNotes
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

  if (loading) return <div>Loading events...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="mt-16 flex flex-col">
      <h1>Upcoming Events</h1>
      <div className="flex flex-row justify-evenly">
        {events.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            description={event.description}
            image={event.image}
          />
        ))}
      </div>
    </div>
  );
}
