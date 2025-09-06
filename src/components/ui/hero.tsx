import { Button } from "./button";

export const Hero = () => {
  return (
    <div className="flex flex-col items-start justify-center sm:justify-end px-4 py-6 sm:px-8 sm:py-12">
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
        <g>
          <path d="M427.9,86.7v92.8h-25v-92.8h-31.1v-22.2h87.3v22.2h-31.1Z" />
          <path d="M508.1,64.5v70.5c0,8.1,1.6,14.2,4.8,18.3,3.2,4,8.5,5.9,16,5.9s12.8-2,16-5.9c3.2-4.1,4.8-10.2,4.8-18.3v-70.5h24.4v67.9c0,8.5-.8,15.8-2.5,22.1-1.5,6.2-4.1,11.3-7.7,15.3-3.6,4-8.3,6.9-14,8.9-5.7,1.9-12.7,2.8-20.9,2.8s-15.2-.9-20.9-2.8c-5.7-2-10.4-4.9-14-8.9-3.6-4.1-6.3-9.2-7.9-15.3-1.5-6.3-2.3-13.6-2.3-22.1v-67.9h24.4Z" />
          <path d="M693,104h-.5l-8.4,16.8-22.4,40.7-21.9-40.5-8.7-18.1h-.5v76.6h-23.6v-115h26.5l28.2,53.9h.3l27.8-53.9h26.7v115h-23.6v-75.5Z" />
          <path d="M763.1,181.3c-4.9,0-8.6-1.2-11-3.6-2.3-2.5-3.5-5.7-3.5-9.6v-3.3c0-3.8,1.2-7,3.5-9.4,2.4-2.5,6.1-3.8,11-3.8s8.6,1.3,10.9,3.8c2.4,2.4,3.6,5.5,3.6,9.4v3.3c0,3.8-1.2,7-3.6,9.6-2.3,2.4-5.9,3.6-10.9,3.6Z" />
          <path d="M872.9,179.5c-4.4,0-8.1-1.4-11-4.1-2.9-2.7-4.7-6.4-5.4-11h-1c-1.3,5.6-4.2,9.9-8.7,12.9-4.5,2.9-10,4.3-16.6,4.3s-15.3-2.3-19.9-6.9c-4.6-4.6-6.9-10.7-6.9-18.3s3.3-15.9,9.9-20.3c6.7-4.5,15.8-6.8,27.2-6.8h13.7v-5.4c0-4.2-1.1-7.5-3.3-9.9-2.2-2.5-5.9-3.8-11-3.8s-8.7,1-11.5,3.1c-2.9,2.1-5.2,4.4-7.1,7.1l-14.5-12.9c3.5-5.2,7.9-9.2,13.2-12,5.4-3,12.6-4.4,21.7-4.4s21.5,2.7,27.7,8.1c6.2,5.4,9.2,13.2,9.2,23.6v37.9h8.1v18.9h-13.5ZM839.1,164.5c4.1,0,7.5-.9,10.4-2.6,3-1.8,4.4-4.6,4.4-8.6v-10.2h-11.9c-9.6,0-14.3,3.2-14.3,9.7v2.5c0,3.2,1,5.5,3,7.1,2,1.4,4.8,2.1,8.4,2.1Z" />
          <path d="M923.2,83.8c-4.9,0-8.6-1.1-10.9-3.3-2.2-2.3-3.3-5.2-3.3-8.7v-3.6c0-3.5,1.1-6.4,3.3-8.6,2.3-2.3,5.9-3.5,10.9-3.5s8.5,1.2,10.7,3.5c2.3,2.2,3.5,5.1,3.5,8.6v3.6c0,3.5-1.2,6.4-3.5,8.7-2.2,2.2-5.8,3.3-10.7,3.3ZM911,93h24.4v86.5h-24.4v-86.5Z" />
        </g>
      </svg>

      {/* Text */}
      <p className="mt-2 font-thin text-title sm:text-4xl leading-snug w-full sm:max-w-8/12 mb-2">
        Germany’s leading student initiative focused on
        <b className="bg-gradient-to-r font-medium from-[#891FDB] to-[#E0189A] bg-clip-text text-transparent">
          {" "}
          Artificial Intelligence.
        </b>
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

        <Button
          asChild
          variant="outline2"
          className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
        >
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
