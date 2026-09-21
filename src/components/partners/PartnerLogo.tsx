"use client";

import { useState } from "react";

type PartnerLogoProps = {
  name: string;
  image?: string;
  eager?: boolean;
};

export default function PartnerLogo(props: PartnerLogoProps) {
  // A changed source gets its own retry budget instead of inheriting a failure.
  return <LogoImage key={props.image} {...props} />;
}

function LogoImage({ name, image, eager = false }: PartnerLogoProps) {
  const [attempt, setAttempt] = useState(0);
  let src = image;
  if (image && attempt === 1) {
    const hashIndex = image.indexOf("#");
    const path = hashIndex < 0 ? image : image.slice(0, hashIndex);
    const hash = hashIndex < 0 ? "" : image.slice(hashIndex);
    // Retry once with a fresh URL so a cached transient failure can recover.
    src = `${path}${path.includes("?") ? "&" : "?"}partner-logo-retry=1${hash}`;
  }
  return src && attempt < 2 ? (
    <img
      src={src}
      alt={name}
      width={200}
      height={80}
      loading={eager ? "eager" : "lazy"}
      className="partner-logo-image"
      onError={() => setAttempt((value) => Math.min(value + 1, 2))}
    />
  ) : (
    <span className="partner-logo-fallback">{name}</span>
  );
}
