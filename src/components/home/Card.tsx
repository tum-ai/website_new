import { Button } from "../ui/button";

type CardProps = {
  text: string;
  title: string;
  desc: string;
  buttonText: string;
  link: string;
};

const Card = ({ text, title, desc, buttonText, link }: CardProps) => {
  return (
    <div className="w-full md:absolute z-10 md:w-[38rem] md:h-[20rem] md:left-[3rem] md:bottom-[0.625rem] bg-white shadow-2xl md:shadow-lg rounded-xl flex flex-col items-start px-6 py-6 justify-between">
      <div className="flex flex-col w-full md:gap-4 gap-2">
        <p className="md:text-xl">{text}</p>
        <h1 className="font-bold text-[1.5rem] md:!text-[2rem]">
          <span className="gradient-text">{title}</span>
        </h1>
        <p className="md:text-2xl">{desc}</p>
        <Button className="!bg-[#6517A1] !p-4 md:!text-2xl w-full md:h-[4rem]">
          {" "}
          <a href={link}>{buttonText}</a> {/* TODO: change the link here */}
        </Button>
      </div>
    </div>
  );
};

export default Card;
