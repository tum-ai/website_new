type EventCardProps = {
  title: string;
  description: string;
  image?: string;
};

export default function EventCard({ title, description, image }: EventCardProps) {
  return (
    <div className="max-w-sm bg-purple-900 text-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-white text-sm line-clamp-3">{description}</p>
      </div>
    </div>
  );
}