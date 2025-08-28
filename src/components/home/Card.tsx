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
    <div className="absolute z-10 w-[38rem] h-[20rem] left-[3rem] bottom-[0.625rem] bg-white shadow-lg rounded-xl flex flex-col items-start gap-4 px-6 py-8">
      <p className="text-xl">{text}</p>
      <h1 className="font-bold !text-[2rem]">
        <span className="bg-gradient-to-r from-[#6517A1] to-[#B55BD1] bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      <p className="text-2xl">{desc}</p>
      <Button className="!bg-[#6517A1] !p-4 !text-2xl w-full h-[4rem]">
        <a href={link}>{buttonText}</a> {/* TODO: change the link here */}
      </Button>
    </div>
  );
};

export default Card;
