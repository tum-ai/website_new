import { Button } from "./button";

export const Hero = () => {
  return (
    <div className="flex flex-col items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
      {/* Logo */}
      <svg
        className="h-10 w-auto fill-white mb-4"
        viewBox="0 0 951 228"
        aria-labelledby="tumaiHomepage tumaiLogoDesc"
        role="img"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="tumaiHomepage">TUM.ai Homepage</title>
        <desc id="tumaiLogoDesc">TUM.ai Logo</desc>
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.4218 197.181L87.9235 14.9033C91.4067 6.49417 99.6125 1.01123 108.715 1.01123C108.9 1.01123 109.084 1.0134 109.268 1.01772C109.451 1.0134 109.636 1.01123 109.821 1.01123C118.923 1.01123 127.079 8.33295 130.562 16.7421L206.114 197.181C212.101 211.636 201.477 227.536 185.831 227.536C177.003 227.536 169.034 222.249 165.603 214.115L125.035 117.94C119.151 103.992 99.3844 103.992 93.5005 117.94L52.932 214.115C49.5011 222.249 41.532 227.536 32.7043 227.536C17.0584 227.536 6.43436 211.636 12.4218 197.181Z"
          ></path>
          <path
            d="M88.0771 14.9034L12.5753 197.181C6.58791 211.636 17.2119 227.536 32.8579 227.536C41.6856 227.536 49.6546 222.249 53.0856 214.115L118.63 58.7301L129.656 32.1335C135.8 17.3153 124.909 1.01123 108.868 1.01123C99.766 1.01123 91.5603 6.49417 88.0771 14.9034Z"
            fill="white"
            stroke="white"
            strokeWidth="0.629236"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path d="M199.509 14.9034L275.011 197.181C280.998 211.636 270.374 227.536 254.728 227.536C245.9 227.536 237.931 222.249 234.5 214.115L168.956 58.7301L157.93 32.1335C151.786 17.3153 162.677 1.01123 178.718 1.01123C187.82 1.01123 196.026 6.49417 199.509 14.9034Z"></path>
        </g>
      </svg>

      {/* Text */}
      <p className="mt-2 font-thin text-title sm:text-4xl leading-normal">
        Welcome to TUM.ai, <br />
        Germany’s leading student initiative focused on
        <b className="font-bold"> Artificial Intelligence.</b>
      </p>

      {/* Buttons */}
      <div className="mt-4 flex flex-col gap-3 w-full sm:flex-row sm:gap-4 justify-start">
        <Button
          asChild
          variant="primary"
          className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
        >
          <a href="mailto:partners@tum-ai.com">Become a Partner</a>
        </Button>

        <Button asChild>
          <a
            href="/apply"
            className="w-full bg-transparent border border-[#A144E9] rounded-md px-6 py-3 text-[#A144E9] text-center sm:w-auto"
          >
            Become a Member
          </a>
        </Button>
      </div>
    </div>
  );
};
