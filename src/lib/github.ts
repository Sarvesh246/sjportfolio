import { cacheLife, cacheTag } from "next/cache";
import { HANDLE, SEED_PROJECTS, SEED_USER, ago, fakeSha, heatmap, langColor, ogImage, screenshot, GH } from "./seed";
import type { Commit, Lang, Portfolio, Project, ReadmeSection, TreeEntry } from "./types";

const API = "https://api.github.com";
export const PORTFOLIO_TAG = "portfolio";
export const projectTag = (slug: string) => `project:${slug}`;
const TOKEN = process.env.GITHUB_TOKEN;

type GhRepo = {
  name: string; description: string | null; language: string | null; pushed_at: string;
  homepage: string | null; license: { spdx_id: string } | null; topics?: string[];
  fork: boolean; archived: boolean; html_url: string;
};

const headers = (accept = "application/vnd.github+json"): HeadersInit => ({
  Accept: accept,
  "User-Agent": "sjportfolio",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
});

const gh = async (path: string, accept?: string): Promise<Response> => {
  // Freshness is handled by the "use cache" wrappers below, not per-fetch.
  const res = await fetch(API + path, { headers: headers(accept) });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res;
};

const ghJson = async <T>(path: string): Promise<T> => (await gh(path)).json() as Promise<T>;

const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));

const hostOf = (url: string | null) => (url ? url.replace(/^https?:\/\//, "").replace(/\/$/, "") : null);

/** Total commits via the Link header trick: one commit per page, last page number = count. */
const commitCount = async (repo: string): Promise<number | null> => {
  try {
    const res = await gh(`/repos/${HANDLE}/${repo}/commits?per_page=1`);
    const last = res.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/);
    if (last) return Number(last[1]);
    const rows = (await res.json()) as unknown[];
    return rows.length;
  } catch {
    return null;
  }
};

const mergeRepo = (live: GhRepo, seed: Project | undefined, commits: number | null, stamp: number): Project => {
  const days = daysSince(live.pushed_at);
  const lang = live.language ?? seed?.lang ?? "Text";
  const homepage = hostOf(live.homepage) ?? seed?.homepage ?? null;
  const base: Project = seed ?? {
    slug: live.name, repo: live.name, name: live.name, desc: "", pinned: false, lang, color: langColor(lang),
    commits: 0, days, updated: ago(days), homepage, license: null, topics: [], stack: [], langs: [],
    heat: heatmap(live.name, days < 10 ? 0.75 : 0.4), log: [], tree: [], readme: [], visual: null, og: null,
    url: live.html_url, sample: false,
  };
  return {
    ...base,
    // Curated copy wins; live data fills the gaps and owns anything that changes over time.
    desc: base.desc || live.description || "",
    lang,
    color: langColor(lang),
    commits: commits ?? base.commits,
    days,
    updated: ago(days),
    homepage,
    license: live.license?.spdx_id && live.license.spdx_id !== "NOASSERTION" ? live.license.spdx_id : base.license,
    topics: live.topics?.length ? live.topics : base.topics,
    visual: screenshot(homepage, stamp) ?? ogImage(live.name),
    og: ogImage(live.name),
    url: live.html_url || GH + live.name,
    sample: false,
  };
};

const fetchLive = async (): Promise<Portfolio> => {
  const repos = (await ghJson<GhRepo[]>(`/users/${HANDLE}/repos?per_page=100&sort=pushed`)).filter((r) => !r.fork && !r.archived);
  if (!repos.length) throw new Error("no repos");

  // Commit counts cost one request per repo, so only spend the rate limit when a token is set.
  const counts = TOKEN ? await Promise.all(repos.map((r) => commitCount(r.name))) : repos.map(() => null);
  const stamp = Date.now();
  const projects = repos.map((r, i) => mergeRepo(r, SEED_PROJECTS.find((s) => s.repo === r.name), counts[i], stamp));

  // REST has no "pinned" endpoint, so pins are the curated seed flags; fall back to the freshest deployed repos.
  if (!projects.some((p) => p.pinned)) {
    projects.filter((p) => p.homepage).slice(0, 4).forEach((p) => (p.pinned = true));
  }

  const user = await ghJson<{ name: string | null; avatar_url: string; public_repos: number; html_url: string }>(`/users/${HANDLE}`);
  return {
    live: true,
    projects,
    user: {
      ...SEED_USER,
      name: SEED_USER.name || user.name || HANDLE,
      avatar: user.avatar_url,
      repos: user.public_repos,
      commits: projects.reduce((n, p) => n + p.commits, 0) || SEED_USER.commits,
      live: projects.filter((p) => p.homepage).length,
      synced: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      year: new Date().getFullYear(),
      github: user.html_url,
    },
  };
};

export const getPortfolio = async (): Promise<Portfolio> => {
  "use cache";
  // Re-scrapes about hourly on its own (stale-while-revalidate); the owner's refresh button expires this tag immediately.
  cacheLife("hours");
  cacheTag(PORTFOLIO_TAG);
  try {
    return await fetchLive();
  } catch (err) {
    // warn, not error: this is an expected fallback (a 403 means the 60/hr anonymous limit; set GITHUB_TOKEN).
    console.warn(`[github] live fetch failed, using seed data: ${err instanceof Error ? err.message : err}`);
    // Don't pin a transient failure for the full hour; retry sooner.
    cacheLife({ revalidate: 600, expire: 3600 });
    // Rate-limited, offline, or a build with no network: ship the curated snapshot rather than an error page.
    return { live: false, projects: SEED_PROJECTS, user: SEED_USER };
  }
};

/* ---------- per-project enrichment (README, tree, languages, commits, activity) ---------- */

const cleanInline = (s: string) =>
  s.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[`*_]{1,3}/g, "").replace(/<[^>]+>/g, "").trim();

export const parseReadme = (md: string): ReadmeSection[] => {
  const sections: ReadmeSection[] = [];
  let cur: ReadmeSection | null = null;
  let inCode = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^```/.test(line)) { inCode = !inCode; continue; }
    if (inCode) continue;
    const h = line.match(/^#{1,3}\s+(.+)/);
    if (h) {
      cur = { h: cleanInline(h[1]), p: "", li: [] };
      sections.push(cur);
      continue;
    }
    if (!cur) continue;
    const li = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)/);
    if (li) { if (cur.li.length < 6) cur.li.push(cleanInline(li[1].replace(/^\[[ x]\]\s*/, ""))); continue; }
    const text = cleanInline(line);
    if (text && !cur.p) cur.p = text;
  }
  return sections.filter((s) => s.h && (s.p || s.li.length)).slice(0, 4);
};

// Rendered as "{when} ago", matching the seed's "2h" / "3d" style.
const shortAge = (d: number) => (d === 0 ? "<1d" : d < 7 ? `${d}d` : d < 30 ? `${Math.round(d / 7)}w` : `${Math.round(d / 30)}mo`);

const toLog = (repo: string, rows: { sha: string; commit: { message: string; author: { date: string } } }[]): Commit[] =>
  rows.map((r, k) => ({
    msg: r.commit.message.split("\n")[0],
    when: shortAge(daysSince(r.commit.author.date)),
    sha: r.sha?.slice(0, 7) ?? fakeSha(repo, k),
  }));

export const getProject = async (slug: string): Promise<Project | null> => {
  "use cache";
  cacheLife("hours");
  cacheTag(projectTag(slug));
  const { projects, live } = await getPortfolio();
  const base = projects.find((p) => p.slug === slug);
  if (!base) return null;
  if (!live || base.sample) return base;

  const settle = async <T,>(p: Promise<T>): Promise<T | null> => p.catch(() => null);
  const [langs, readme, tree, commits, activity] = await Promise.all([
    settle(ghJson<Record<string, number>>(`/repos/${HANDLE}/${base.repo}/languages`)),
    settle(gh(`/repos/${HANDLE}/${base.repo}/readme`, "application/vnd.github.raw+json").then((r) => r.text())),
    settle(ghJson<{ path?: string; name: string; type: string }[]>(`/repos/${HANDLE}/${base.repo}/contents`)),
    settle(ghJson<Parameters<typeof toLog>[1]>(`/repos/${HANDLE}/${base.repo}/commits?per_page=5`)),
    settle(ghJson<{ days: number[] }[]>(`/repos/${HANDLE}/${base.repo}/stats/commit_activity`)),
  ]);

  const total = langs ? Object.values(langs).reduce((a, b) => a + b, 0) : 0;
  const liveLangs: Lang[] = langs && total
    ? Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, bytes]) => {
        const v = Math.max(1, Math.round((bytes / total) * 100));
        return { n, v, c: langColor(n), w: `${v}%` };
      })
    : [];
  const liveTree: TreeEntry[] = tree
    ? tree.filter((t) => !t.name.startsWith(".")).sort((a, b) => Number(b.type === "dir") - Number(a.type === "dir") || a.name.localeCompare(b.name))
        .slice(0, 14).map((t) => ({ path: t.type === "dir" ? `${t.name}/` : t.name, dir: t.type === "dir" }))
    : [];
  const parsed = readme ? parseReadme(readme) : [];
  // activity is [{days:[7 daily counts]}] x 52; bucket counts into the same 0-4 scale as the generated heatmap.
  const heat = activity && activity.length >= 52
    ? activity.slice(-52).flatMap((w) => w.days.map((n) => (n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : n < 7 ? 3 : 4)))
    : base.heat;

  return {
    ...base,
    langs: liveLangs.length ? liveLangs : base.langs,
    tree: liveTree.length ? liveTree : base.tree,
    readme: base.readme.length ? base.readme : parsed,
    log: commits?.length ? toLog(base.repo, commits) : base.log,
    heat,
  };
};
