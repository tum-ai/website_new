import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

type ResearchCardProps = {
  title: string;
  description: string;
  image?: string;
  publication?: string;
  keywords?: string; // comma-separated string
};

export default function ResearchCard({
  title,
  description,
  image,
  publication,
  keywords,
}: ResearchCardProps) {
  return (
    <Card className="bg-purple-900 text-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="flex flex-col gap-1 min-h-[5rem]">
        <CardTitle className="text-xl font-semibold text-white line-clamp-3">
          {title}
        </CardTitle>
        {keywords && <p className="text-sm text-purple-300 ">{keywords}</p>}
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover rounded-2xl"
            loading="lazy"
          />
        )}
        <p className="text-white line-clamp-4">{description}</p>
      </CardContent>

      {publication && (
        <CardFooter className="flex justify-end mt-auto">
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
