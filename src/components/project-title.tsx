"use client";

import Link from "next/link";
import { useRef } from "react";
import { Scramble } from "@/components/fx";

export const ProjectTitle = ({ name }: { name: string }) => (
  <h1 className="m-0 font-display text-[clamp(46px,7vw,104px)] leading-[.9] tracking-[-.045em] break-words uppercase">
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
      <span className="font-display text-[clamp(36px,6vw,88px)] leading-[.95] tracking-[-.04em] uppercase">
        <Scramble text={name} hover trigger={ref} />
      </span>
    </Link>
  );
};
