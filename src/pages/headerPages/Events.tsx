import { useEffect, useState } from "react";

export default function Events() {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/getNotes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      Upcoming Events
      {notes.map((note) => (
        <div key={note.id}>
          <h1>{note.properties.title.title[0]?.plain_text}</h1>
          <p>{note.properties.desc.rich_text[0]?.plain_text}</p>
          {note.properties["Files & media"].files.length > 0 &&
            note.properties["Files & media"].files[0].file?.url && (
              <img
                src={note.properties["Files & media"].files[0].file.url}
                alt="Event"
                style={{ width: "300px", height: "auto", marginTop: "1rem" }}
              />
            )}
        </div>
      ))}
      <h2>End of the Events</h2>
    </div>
  );
}
