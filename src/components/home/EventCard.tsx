type Date = {
  day: string;
  date: string;
};

type EventCardProps = {
  img: string;
  title: string;
  date: Date;
};

const EventCard = ({ img, title, date }: EventCardProps) => {
  return (
    <div className="relative w-[25rem] h-[25rem] max-w-md flex-1/3 rounded-2xl overflow-hidden shadow-lg">
      {/* Background image */}
      <img src={img} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        {/* Date info */}
        <div>
          <p className="text-lg font-semibold">{date.day}</p>
          <p className="text-sm">{date.date}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
