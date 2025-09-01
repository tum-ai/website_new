import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
    // <Card className="bg-purple-900 text-white rounded-lg shadow-md overflow-hidden py-3
    //  hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
    //   <CardHeader className="flex flex-col gap-1 min-h-[5rem]">
    //     <CardTitle className="text-xl font-semibold text-white line-clamp-3">
    //       {title}
    //     </CardTitle>
    //     {keywords && <p className="text-sm text-purple-300 ">{keywords}</p>}
    //   </CardHeader>

    //   <CardContent className="flex flex-col flex-1 gap-4">
    //     {image && (
    //       <img
    //         src={image}
    //         alt={title}
    //         className="w-full h-48 object-cover rounded-2xl"
    //         loading="lazy"
    //       />
    //     )}
    //     <p className="text-white line-clamp-4">{description}</p>
    //   </CardContent>

    //   {publication && (
    //     <CardFooter className="flex justify-end mt-auto">
    //       <a
    //         href={publication}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         className="inline-block text-purple-300 hover:text-purple-100 transition-colors"
    //       >
    //         Read Publication
    //       </a>
    //     </CardFooter>
    //   )}
    // </Card>

    <Card className="hover:shadow-lg transition-shadow justify-between">
      <div className="p-6">
        <AspectRatio ratio={4 / 3}>
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full rounded-md object-cover shadow-xl"
            />
          ) : (
            <div className="h-full w-full rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center p-6">
              <h3 className="text-lg font-semibold text-purple-800 text-center leading-tight">
                {title}
              </h3>
            </div>
          )}
        </AspectRatio>
      </div>
      <CardHeader className="pb-0">
        <CardTitle className="text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div>
          {keywords && <p className="text-sm text-purple-500 mb-2">{keywords}</p>}
          <p className="text-sm my-2">
            {description}
          </p>
        </div>
      </CardContent>
      <CardFooter>

        {publication && (<Button size={"lg"}
          variant="primary"
          onClick={() => {
              window.open(publication, '_blank');
            }}
          className="text-white w-full mb-5 shadow-xl">                        
          Read Publication
        </Button>)}

      </CardFooter>
    </Card>
  );
}
