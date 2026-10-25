"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CountUp, Reveal } from "@/components/fx";
import { ProjectImage } from "@/components/project-image";
import { FEATURED_ROTATION, cardColor, pad2, statusOf, stripeArt } from "@/lib/palette";
import type { Project, User } from "@/lib/types";

const matches = (p: Project, q: string) =>
  !q || [p.name, p.repo, p.desc, p.lang, ...p.topics, ...p.stack].join(" ").toLowerCase().includes(q);

const SectionHeading = ({ title, pill }: { title: string; pill: React.ReactNode }) => (
  <Reveal className="mb-[34px] flex flex-wrap items-center gap-[18px]">
    <h2 className="m-0 font-display text-[clamp(40px,6vw,88px)] leading-[.95] tracking-[-.04em] uppercase">{title}</h2>
    {pill}
  </Reveal>
);

export const HomeView = ({ projects, user }: { projects: Project[]; user: User }) => {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  // Colour and number come from position in the full list, so a card keeps its look across searches.
  const indexed = useMemo(() => projects.map((p, i) => ({ p, i })), [projects]);
  const featured = indexed.filter(({ p }) => p.pinned);
  const all = useMemo(
    () => indexed.filter(({ p }) => matches(p, query)).sort((a, b) => Number(b.p.pinned) - Number(a.p.pinned) || a.p.days - b.p.days),
    [indexed, query],
  );

  const stats = [
    { n: user.repos, l: "Repos" },
    { n: user.commits, l: "Commits" },
    { n: user.live, l: "Live apps" },
    { n: new Set(projects.map((p) => p.lang)).size, l: "Languages" },
  ];

  return (
    <>
      <header className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-[clamp(28px,4vw,56px)] px-6 pt-[clamp(40px,6vw,80px)]">
        <div className="grid gap-[26px]">
          <h1 className="m-0 animate-pop font-display text-[clamp(56px,9vw,140px)] leading-[.88] tracking-[-.045em] uppercase [animation-delay:.1s]">
            I build<br />
            <span className="inline-block -rotate-2 border-4 border-black bg-sun px-[.12em] shadow-hard-lg">cool</span>
            <br />stuff.
          </h1>
          <p className="m-0 max-w-[520px] animate-pop text-pretty text-[clamp(18px,1.6vw,22px)] leading-normal font-medium [animation-delay:.2s]">
            {user.name}. Local-first apps, AI agents that don’t fall over, and the web around them. Everything below is pulled straight from GitHub.
          </p>
          <label className="flex max-w-[520px] animate-pop items-center gap-3 rounded-[14px] border-3 border-black bg-white pr-2 pl-[18px] shadow-hard-md focus-within:bg-[#fffbe6] [animation-delay:.3s]">
            <span className="font-mono text-base leading-none font-bold" aria-hidden="true">?</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${projects.length} repos…`}
              aria-label="Search repositories"
              className="min-w-0 flex-1 bg-transparent py-[18px] text-base leading-none font-semibold outline-none"
            />
            <a href="#all" className="rounded-lg bg-black px-3 py-2.5 font-mono text-[13px] leading-none font-bold text-sun">
              {all.length}
            </a>
          </label>
        </div>

        <div className="relative grid min-h-[380px] place-items-center">
          <div className="absolute inset-x-[6%] inset-y-[4%] rotate-3 rounded-[28px] border-4 border-black bg-sky shadow-hard-xl" />
          <div className="relative w-[78%] -rotate-3 overflow-hidden rounded-[20px] border-4 border-black bg-white shadow-hard-lg">
            <div className="flex items-center gap-2 border-b-4 border-black bg-bubble px-3.5 py-3">
              <span className="size-3.5 rounded-full border-3 border-black bg-white" />
              <span className="size-3.5 rounded-full border-3 border-black bg-sun" />
              <span className="ml-auto font-mono text-xs leading-none font-bold">stats.exe</span>
            </div>
            <div className="grid grid-cols-2">
              {stats.map((s) => (
                <div key={s.l} className="grid gap-2 border-r-3 border-b-3 border-black px-[18px] py-5">
                  <span className="font-display text-[clamp(34px,4vw,54px)] leading-none tracking-[-.04em]"><CountUp to={s.n} /></span>
                  <span className="nb-label">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 200 200" className="absolute -top-2 -right-1.5 w-[clamp(110px,12vw,150px)] animate-spin-slow" aria-hidden="true">
            <circle cx="100" cy="100" r="96" fill="#ff4d8d" stroke="#000" strokeWidth="5" />
            <defs><path id="sticker-path" d="M100,100 m-68,0 a68,68 0 1,1 136,0 a68,68 0 1,1 -136,0" /></defs>
            {/* textLength pins the text to the circle's circumference (2π·68 ≈ 427) so the three phrases fill it evenly. */}
            <text fontFamily="var(--font-space-mono), monospace" fontWeight="700" fontSize="17">
              <textPath href="#sticker-path" textLength="422" lengthAdjust="spacing">BUILD IT · REFINE IT · SHIP IT · </textPath>
            </text>
          </svg>
        </div>
      </header>

      <section id="work" className="mx-auto max-w-[1280px] px-6 pt-[clamp(80px,9vw,130px)]">
        <SectionHeading
          title="Big projects"
          pill={<span className="rotate-3 rounded-full bg-black px-3.5 py-[9px] font-mono text-sm leading-none font-bold text-sun">PINNED ×{featured.length}</span>}
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-x-7 gap-y-[34px]">
          {featured.map(({ p, i }, k) => (
            <Reveal key={p.slug} delay={(k % 2) * 100}>
              <Link
                href={`/projects/${p.slug}`}
                className="grid rotate-(--rot) overflow-hidden rounded-3xl border-4 border-black shadow-hard-xl transition-[translate,rotate,box-shadow] duration-200 [transition-timing-function:cubic-bezier(.3,1.5,.5,1)] hover:translate-x-1 hover:translate-y-1 hover:rotate-0 hover:shadow-[4px_4px_0_#000]"
                style={{ background: cardColor(i), "--rot": `${FEATURED_ROTATION[k % 4]}deg` } as React.CSSProperties}
              >
                <div className="relative aspect-video border-b-4 border-black" style={{ background: stripeArt(p.color) }}>
                  <ProjectImage src={p.visual} fallback={p.og} />
                  <span className="absolute top-3.5 left-3.5 rounded-full border-3 border-black bg-white px-[11px] py-2 font-mono text-xs leading-none font-bold">{statusOf(p)}</span>
                  <span className="absolute top-3.5 right-3.5 grid size-11 place-items-center rounded-full bg-black font-display text-[15px] leading-none text-sun">{pad2(i)}</span>
                </div>
                <div className="grid gap-3.5 p-6">
                  <h3 className="m-0 font-display text-[clamp(30px,3vw,42px)] leading-none tracking-[-.035em] [overflow-wrap:anywhere] uppercase">{p.name}</h3>
                  <p className="m-0 text-pretty text-[16.5px] leading-normal font-medium">{p.desc}</p>
                  <div className="flex flex-wrap gap-2 font-mono text-xs leading-none font-bold">
                    <span className="rounded-lg border-[2.5px] border-black bg-white px-2.5 py-2">{p.lang}</span>
                    {p.commits > 0 && <span className="rounded-lg border-[2.5px] border-black bg-white px-2.5 py-2">{p.commits.toLocaleString("en-US")} commits</span>}
                    <span className="ml-auto rounded-lg border-[2.5px] border-black bg-black px-2.5 py-2 text-white">OPEN →</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="all" className="mx-auto max-w-[1280px] px-6 pt-[clamp(90px,10vw,150px)] pb-[clamp(60px,8vw,100px)]">
        <SectionHeading
          title="The whole pile"
          pill={<span className="-rotate-3 rounded-full border-3 border-black bg-bubble px-3.5 py-[9px] font-mono text-sm leading-none font-bold">{all.length} REPOS</span>}
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-5">
          {all.map(({ p, i }) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group grid content-start gap-3.5 rounded-2xl border-3 border-black bg-white p-5 shadow-hard transition-[translate,box-shadow,background-color] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-xs hover:bg-(--card)"
              style={{ "--card": cardColor(i) } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-2.5">
                <h3 className="m-0 min-w-0 font-display text-[22px] leading-[1.05] tracking-[-.03em] [overflow-wrap:anywhere] uppercase">{p.name}</h3>
                <span className="flex-none font-mono text-[11px] leading-none font-bold text-black/65">{pad2(i)}</span>
              </div>
              <p className="nb-clamp-3 m-0 text-[14.5px] leading-normal font-medium">{p.desc || "No description yet."}</p>
              <div className="flex items-center gap-2.5 border-t-3 border-dashed border-black pt-3 font-mono text-[11.5px] leading-none font-bold">
                <span className="size-3 rounded-full border-2 border-black" style={{ background: p.color }} />
                {p.lang}
                <span className="ml-auto">{p.updated}</span>
              </div>
            </Link>
          ))}
        </div>
        {all.length === 0 && (
          <div className="mt-5 rounded-2xl border-3 border-dashed border-black bg-white px-6 py-12 text-center font-display text-2xl leading-tight uppercase">
            Nothing for “{q}” 🤷
          </div>
        )}
      </section>
    </>
  );
};
