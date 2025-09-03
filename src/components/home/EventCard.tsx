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
      {img ? (
        <img src={img} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full relative overflow-hidden rounded-lg bg-accent-foreground flex items-center justify-center">
          <img
            src="/assets/logo_new_white_standard.png"
            alt="Placeholder"
            className="h-3/4 w-3/4 object-contain opacity-50"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
            }}
          />
        </div>
      )}
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
