import { Button } from "../ui/button";

type CardProps = {
  text: string;
  title: string;
  desc: string;
  buttonText: string;
};

const Card = ({ text, title, desc, buttonText }: CardProps) => {
  return (
    <div className="absolute z-10 w-[620px] h-[327px] left-[46px] bottom-[10px] bg-white shadow-lg rounded-xl flex flex-col items-start gap-4 px-6 py-8">
      <p className="text-xl">{text}</p>
      <h1 className="font-bold !text-[32px]">
        <span className="bg-gradient-to-r from-[#6517A1] to-[#B55BD1] bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      <p className="text-2xl">{desc}</p>
      <Button className="!bg-[#6517A1] !p-4 !text-2xl w-full h-[65px]">
        <a href="#">{buttonText}</a>
      </Button>
    </div>
  );
};

export default Card;
