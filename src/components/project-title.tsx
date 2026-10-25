"use client";

import Link from "next/link";
import { useRef } from "react";
import { Scramble } from "@/components/fx";

// Archivo Black is wide, so scale the size down as names get longer instead of letting them spill out of the card.
const titleSize = (name: string) =>
  name.length <= 8 ? "text-[clamp(44px,5.4vw,84px)]"
  : name.length <= 12 ? "text-[clamp(32px,3.8vw,56px)]"
  : name.length <= 18 ? "text-[clamp(26px,2.8vw,40px)]"
  : "text-[clamp(22px,2.2vw,32px)]";

export const ProjectTitle = ({ name }: { name: string }) => (
  <h1 className={`m-0 min-w-0 font-display ${titleSize(name)} leading-[.95] tracking-[-.04em] break-words uppercase`}>
    <Scramble text={name} delay={100} />
  </h1>
);

export const NextUp = ({ slug, name }: { slug: string; name: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={ref}
      href={`/projects/${slug}`}
      className="mt-[clamp(56px,7vw,96px)] grid w-full gap-3 rounded-[28px] border-4 border-black bg-sun p-[clamp(26px,4vw,48px)] shadow-hard-xl transition-[translate,box-shadow] duration-150 hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-[5px_5px_0_#000]"
    >
      <span className="font-mono text-[13px] leading-none font-bold">NEXT UP →</span>
      <span className="font-display text-[clamp(30px,5vw,76px)] leading-[.95] tracking-[-.04em] [overflow-wrap:anywhere] uppercase">
        <Scramble text={name} hover trigger={ref} />
      </span>
    </Link>
  );
};
