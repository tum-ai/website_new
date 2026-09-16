"use client";

import { useState } from "react";

export default function PartnerLogo({
  name,
  image,
  eager = false,
}: {
  name: string;
  image?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return image && !failed ? (
    <img
      src={image}
      alt={name}
      width={200}
      height={80}
      loading={eager ? "eager" : "lazy"}
      className="partner-logo-image"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="partner-logo-fallback">{name}</span>
  );
}
