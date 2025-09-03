import Card from "./Card";

type CarouselItemProps = {
  imgSrc: string;
  text: string;
  title: string;
  desc: string;
  buttonText: string;
  link: string;
};

const CarouselItem = ({
  imgSrc,
  text,
  title,
  desc,
  buttonText,
  link,
}: CarouselItemProps) => {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 px-4 md:px-10 py-14 md:py-12 justify-center w-dvw max-w-full">
      {/* image */}
        <img
          className="aspect-[16/9] object-cover rounded-md"
          src={imgSrc}
          alt={title}
        />

      {/* card */}
      <div className="flex items-center">
        <Card
          link={link}
          text={text}
          title={title}
          desc={desc}
          buttonText={buttonText}
        />
      </div>
    </div>
  );
};
export default CarouselItem;
