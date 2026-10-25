"use client";

import { useState } from "react";

/** Screenshot with a fallback chain: homepage capture → GitHub social card → nothing (parent shows the stripe art). */
export const ProjectImage = ({ src, fallback, priority }: { src: string | null; fallback: string | null; priority?: boolean }) => {
  const [stage, setStage] = useState(0);
  const url = [src, fallback].filter((u, i, all): u is string => !!u && all.indexOf(u) === i)[stage];
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote capture services, sized by the parent frame
    <img
      key={url}
      src={url}
      alt=""
      loading={priority ? "eager" : "lazy"}
      onError={() => setStage((s) => s + 1)}
      className="absolute inset-0 h-full w-full bg-white object-contain object-center"
    />
  );
};
