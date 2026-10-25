import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Reveal } from "@/components/fx";
import { ProjectImage } from "@/components/project-image";
import { NextUp, ProjectTitle } from "@/components/project-title";
import { getPortfolio, getProject } from "@/lib/github";
import { HEAT_OPACITY, cardColor, pad2, statusOf, stripeArt } from "@/lib/palette";
import { getThumbnails, withThumbnails } from "@/lib/thumbnails";
import type { TreeEntry } from "@/lib/types";
import { AdminPanel } from "@/components/admin-panel";

export const generateStaticParams = async () => (await getPortfolio()).projects.map((p) => ({ slug: p.slug }));

export const generateMetadata = async ({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const p = await getProject(slug);
  return p ? { title: p.name, description: p.desc } : {};
};

const Panel = ({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) => (
  <section className={`grid content-start gap-4 rounded-[20px] border-4 border-black p-[26px] shadow-hard-md ${className}`}>
    <span className="nb-label">{title}</span>
    {children}
  </section>
);

const treeRows = (tree: TreeEntry[]) => {
  const paths = new Set(tree.map((t) => t.path));
  return tree.map((t) => {
    const segs = t.path.split("/").filter(Boolean);
    const nested = segs.length > 1 && paths.has(segs.slice(0, -1).join("/") + "/");
    return {
      key: t.path,
      label: (nested ? segs[segs.length - 1] : segs.join("/")) + (t.dir ? "/" : ""),
      pad: nested ? 32 : 10,
      glyph: t.dir ? "▸" : "·",
    };
  });
};

// Reading `params` is URL data, so it has to sit under Suspense; the fallback is the instant shell for navigations.
const ProjectSkeleton = () => (
  <main className="mx-auto max-w-[1280px] px-6 pt-[clamp(32px,4vw,56px)]" aria-busy="true">
    <span className="mb-[34px] inline-block rounded-[10px] border-3 border-black bg-white px-4 py-3 font-mono text-sm leading-none font-bold shadow-hard-sm">← BACK</span>
    <div className="min-h-[360px] rounded-[28px] border-4 border-black bg-sun shadow-hard-xl" />
  </main>
);

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: { params: PageProps<"/projects/[slug]">["params"] }) {
  const { slug } = await params;
  const [base, { projects }, thumbs] = await Promise.all([getProject(slug), getPortfolio(), getThumbnails()]);
  if (!base) notFound();
  const p = withThumbnails([base], thumbs)[0];

  const i = projects.findIndex((x) => x.slug === slug);
  const next = projects[(i + 1) % projects.length];
  const bg = cardColor(i);
  const kpis = [
    // 0 means "GitHub didn't give us a count" (no token), not a repo with no commits.
    { k: "Commits", v: p.commits ? p.commits.toLocaleString("en-US") : "—", d: 0, bg: "#ffd23f" },
    { k: "Last push", v: p.updated, d: 60, bg: "#8ec5ff" },
    { k: "Languages", v: p.langs.length ? String(p.langs.length) : "—", d: 120, bg: "#b6f2a0" },
    { k: "License", v: p.license ?? "—", d: 180, bg: "#ff90e8" },
  ];
  const readme = p.readme.length ? p.readme : [{ h: "No README yet", p: "This repo hasn’t got a README to summarise, so there’s nothing to show here.", li: [] }];

  return (
    <main className="mx-auto max-w-[1280px] px-6 pt-[clamp(32px,4vw,56px)]">
      <Link href="/" className="mb-[34px] inline-block rounded-[10px] border-3 border-black bg-white px-4 py-3 font-mono text-sm leading-none font-bold shadow-hard-sm transition-colors hover:bg-sun">
        ← BACK
      </Link>

      <header className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-stretch gap-[34px]">
        <div className="grid min-w-0 content-between gap-[22px] rounded-[28px] border-4 border-black p-[clamp(24px,4vw,48px)] shadow-hard-xl" style={{ background: bg }}>
          <span className="w-fit rounded-full border-3 border-black bg-white px-3 py-2 font-mono text-xs leading-none font-bold">
            {statusOf(p)} · #{pad2(i)}
          </span>
          <ProjectTitle name={p.name} />
          <p className="m-0 text-pretty text-[clamp(17px,1.5vw,20px)] leading-normal font-medium">{p.desc}</p>
          <div className="flex flex-wrap gap-3">
            {p.homepage && (
              <a
                href={`https://${p.homepage}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border-3 border-black bg-black px-[22px] py-4 text-[15px] leading-none font-extrabold text-sun shadow-[4px_4px_0_#fff] transition-[translate,box-shadow] duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#fff]"
              >
                LIVE SITE ↗
              </a>
            )}
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border-3 border-black bg-white px-[22px] py-4 text-[15px] leading-none font-extrabold shadow-hard-sm transition-[translate,box-shadow] duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-hard-xs"
            >
              GITHUB ↗
            </a>
          </div>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-[28px] border-4 border-black shadow-hard-xl" style={{ background: stripeArt(p.color) }}>
          <ProjectImage src={p.visual} fallback={p.og} priority />
          <span className="absolute bottom-3.5 left-3.5 rounded-lg border-3 border-black bg-white px-[11px] py-2 font-mono text-xs leading-none font-bold">
            {p.custom ? "custom thumbnail" : (p.homepage ?? "github social card")}
          </span>
        </div>
      </header>

      <AdminPanel slug={p.slug} custom={!!p.custom} />

      {p.topics.length > 0 && (
        <div className="mt-[34px] flex flex-wrap gap-2.5">
          {p.topics.map((t) => (
            <span key={t} className="rounded-full border-3 border-black bg-white px-[13px] py-2.5 font-mono text-[13px] leading-none font-bold">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-[34px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-5">
        {kpis.map((k) => (
          <Reveal key={k.k} delay={k.d} className="grid gap-3 rounded-[18px] border-3 border-black p-[22px] shadow-hard-md" style={{ background: k.bg }}>
            <span className="nb-label">{k.k}</span>
            <span className="font-display text-[clamp(28px,3vw,42px)] leading-none tracking-[-.03em]">{k.v}</span>
          </Reveal>
        ))}
      </div>

      <div className="mt-11 grid grid-cols-1 items-start gap-7 lg:grid-cols-[2fr_1fr]">
        <Reveal className="grid min-w-0 gap-[38px] rounded-3xl border-4 border-black bg-white p-[clamp(24px,3vw,44px)] shadow-hard-lg">
          {readme.map((s) => (
            <section key={s.h} className="grid gap-3.5">
              <h2 className="m-0 font-display text-[clamp(26px,2.6vw,36px)] leading-[1.05] tracking-[-.03em] uppercase">
                <span className="bg-sun px-[.2em] box-decoration-clone">{s.h}</span>
              </h2>
              {s.p && <p className="m-0 text-pretty text-[17px] leading-[1.65] font-medium">{s.p}</p>}
              {s.li.length > 0 && (
                <div className="grid gap-2.5">
                  {s.li.map((li) => (
                    <div key={li} className="grid grid-cols-[34px_1fr] gap-1.5 text-base leading-normal font-medium">
                      <span className="grid size-[22px] place-items-center rounded-md border-[2.5px] border-black bg-mint font-mono text-[13px] leading-none font-bold" aria-hidden="true">✓</span>
                      <span>{li}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </Reveal>
        <aside className="grid gap-7">
          <Reveal delay={80}>
            <Panel title="Languages" className="rounded-[20px] bg-sky">
              <div className="flex h-[22px] overflow-hidden rounded-full border-3 border-black bg-white">
                {p.langs.map((l) => (
                  <span key={l.n} className="border-r-2 border-black" style={{ width: l.w, background: l.c }} />
                ))}
              </div>
              {p.langs.map((l) => (
                <span key={l.n} className="flex items-center gap-2 text-sm leading-none font-bold">
                  <span className="size-3 rounded-full border-2 border-black" style={{ background: l.c }} />
                  {l.n}
                  <span className="ml-auto font-mono text-xs">{l.w}</span>
                </span>
              ))}
            </Panel>
          </Reveal>
          {p.stack.length > 0 && (
            <Reveal delay={160}>
              <Panel title="Stack" className="bg-bubble">
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-lg border-[2.5px] border-black bg-white px-[11px] py-[9px] text-[13px] leading-none font-bold">{s}</span>
                  ))}
                </div>
              </Panel>
            </Reveal>
          )}
        </aside>
      </div>

      <Reveal className="mt-11 grid gap-[18px] rounded-3xl border-4 border-black bg-black p-[clamp(22px,3vw,34px)] text-white shadow-[8px_8px_0_#ffd23f]">
        <div className="nb-label flex flex-wrap justify-between gap-2.5">
          <span>Activity · 52 weeks</span>
          {p.commits > 0 && <span className="text-sun">{p.commits.toLocaleString("en-US")} commits</span>}
        </div>
        <div className="grid grid-flow-col grid-rows-7 auto-cols-fr gap-1" aria-hidden="true">
          {p.heat.map((v, k) => (
            <span key={k} className="aspect-square rounded-[3px] bg-sun" style={{ opacity: HEAT_OPACITY[v] }} />
          ))}
        </div>
      </Reveal>

      <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-7">
        <Reveal>
          <Panel title="File tree" className="bg-white">
            <div className="grid gap-2">
              {treeRows(p.tree).map((t) => (
                <div key={t.key} className="flex gap-2.5 rounded-lg py-[9px] pr-2.5 font-mono text-[13.5px] leading-none font-bold hover:bg-sun" style={{ paddingLeft: t.pad }}>
                  <span>{t.glyph}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={100}>
          <Panel title="Recent commits" className="bg-mint">
            {p.log.map((c, k) => (
              <div key={`${c.sha}-${k}`} className="grid gap-2 rounded-xl border-3 border-black bg-white p-3.5">
                <span className="text-[15px] leading-[1.4] font-semibold">{c.msg}</span>
                <span className="font-mono text-xs leading-none font-bold">{c.sha} · {c.when} ago</span>
              </div>
            ))}
          </Panel>
        </Reveal>
      </div>

      <NextUp slug={next.slug} name={next.name} />
    </main>
  );
}
