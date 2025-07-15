import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";

type ResearchCardProps = {
  title: string;
  description: string;
  image?: string;
  publication?: string;
};

export default function ResearchCard({
  title,
  description,
  image,
  publication,
}: ResearchCardProps) {
  return (
    <Card className="bg-purple-900 text-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="">
        <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="flex items-center justify-between gap-4">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-full h-48 object-cover rounded-2xl"
              loading="lazy"
            />
          )}
          <p className="text-white">{description}</p>
        </div>
      </CardContent>
      {publication && (
        <CardFooter className="flex justify-end">
          <a
            href={publication}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-purple-300 hover:text-purple-100 transition-colors"
          >
            Read Publication
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
