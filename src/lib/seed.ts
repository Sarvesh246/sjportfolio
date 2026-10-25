import type { Commit, Lang, Project, ReadmeSection, TreeEntry, User } from "./types";

export const HANDLE = process.env.GITHUB_USER ?? "Sarvesh246";
export const GH = `https://github.com/${HANDLE}/`;

export const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5", Rust: "#dea584", Go: "#00ADD8",
  "C++": "#f34b7d", Swift: "#F05138", Shell: "#89e051", CSS: "#a07ce0", PLpgSQL: "#4f8cc9",
  Dockerfile: "#6b8fa3", HTML: "#e34c26", "Jupyter Notebook": "#DA5B0B", Lua: "#000080", CMake: "#DA3434",
};
export const langColor = (n: string) => LANG_COLORS[n] ?? "#888888";

/** Deterministic PRNG so generated heatmaps are stable between renders. */
const rng = (seed: string) => {
  let s = 7;
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const heatmap = (seed: string, activity = 0.7, weeks = 52): number[] => {
  const r = rng(seed);
  const out: number[] = [];
  for (let w = 0; w < weeks; w++) {
    const ramp = 0.35 + 0.65 * Math.pow(w / weeks, 0.6);
    const burst = r() < activity ? 1 : 0.15;
    for (let d = 0; d < 7; d++) {
      const v = r() * burst * ramp * (d === 0 || d === 6 ? 0.7 : 1);
      out.push(v < 0.18 ? 0 : v < 0.36 ? 1 : v < 0.54 ? 2 : v < 0.72 ? 3 : 4);
    }
  }
  return out;
};

export const ago = (d: number) =>
  d === 0 ? "today" : d === 1 ? "yesterday" : d < 7 ? `${d}d ago` : d < 30 ? `${Math.round(d / 7)}w ago` : `${Math.round(d / 30)}mo ago`;

export const fakeSha = (repo: string, k: number) =>
  (repo.charCodeAt(k % repo.length) * 7919 + k * 104729).toString(16).slice(0, 7);

export const ogImage = (repo: string) => `https://opengraph.githubassets.com/1/${HANDLE}/${repo}`;
// Microlink's free tier needs no key and serves a small JPEG. thum.io (used in the design mock) now returns a
// "sign up" placeholder with a 200 status, which an onError fallback can't catch. If Microlink rate-limits, the
// response isn't an image, so <ProjectImage> drops to the GitHub social card.
export const screenshot = (host: string | null) =>
  host
    ? `https://api.microlink.io/?url=${encodeURIComponent(`https://${host.replace(/^https?:\/\//, "")}`)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=720&viewport.deviceScaleFactor=1&screenshot.type=jpeg&screenshot.quality=70`
    : null;

type Raw = {
  repo: string; name: string; pinned?: boolean; lang: string; commits: number; days: number;
  homepage: string | null; license: string | null; desc?: string | null; auto?: string;
  topics: string[]; stack: string[]; langs: [string, number][]; tree: string[];
  readme: ReadmeSection[]; log: [string, string][]; sample?: boolean;
};

const raw: Raw[] = [
  { repo: "calendar", name: "Datebook", pinned: true, lang: "TypeScript", commits: 204, days: 1, homepage: "datebookcalendar.vercel.app", license: "MIT",
    desc: "Local-first calendar and assignment tracker for students. Next.js PWA with optional Supabase sync.",
    topics: ["calendar", "nextjs", "pwa", "supabase", "typescript", "zustand"],
    stack: ["Next.js", "TypeScript", "Zustand", "Supabase", "Vitest", "Web Push", "Gemini"],
    langs: [["TypeScript", 91], ["CSS", 5], ["PLpgSQL", 3], ["JavaScript", 1]],
    tree: ["app/", "components/", "components/pages/", "lib/", "lib/llm/", "supabase/migrations/", "public/", "scripts/", "docs/", "next.config.ts", "vercel.json"],
    readme: [
      { h: "What it does", p: "Runs entirely in the browser, installable as a PWA, and can optionally sync across devices through Supabase.", li: ["Items are events, assignments or tasks — todo, doing or done.", "Today, month & week Calendar, Agenda and a weekly class Schedule.", "Import from ICS feeds (Canvas, Google, Outlook) and syllabus PDFs.", "An on-device assistant that only calls a model for what it can’t answer."] },
      { h: "How it is put together", p: "State lives in a Zustand store persisted to localStorage. Sync is layered on top, not underneath — the app never needs the network to work. Sync is last-write-wins on updatedAt with tombstones for deletes.", li: ["Spring-based motion tokens; hot paths animate only transform and opacity.", "Closed-app reminders over web push, dispatched every ten minutes."] },
    ],
    log: [["feat(sync): tombstones for deleted items", "2h"], ["fix(push): retry dispatch on 401 with named error", "1d"], ["feat(import): parse syllabus PDFs into assignments", "3d"], ["perf(calendar): virtualize week view rows", "5d"], ["chore(deps): bump next to 16.1", "1w"]] },
  { repo: "jarvis-cloud", name: "Vaelo", pinned: true, lang: "JavaScript", commits: 331, days: 0, homepage: "vaelochat.vercel.app", license: null,
    desc: "Use Jarvis from my phone without leaving my PC running — a cloud deployment of Hermes Agent with a resumable streaming relay.",
    topics: ["ai-agent", "hermes", "pwa", "docker", "render", "tauri"],
    stack: ["Hermes Agent", "Docker", "Python relay", "Vercel", "Postgres", "Tauri", "OpenRouter"],
    langs: [["JavaScript", 61], ["Python", 31], ["CSS", 5], ["Dockerfile", 3]],
    tree: ["cloud/", "cloud/relay.py", "deploy/", "deploy/freellmapi/", "docs/", "tests/", "web/", "web/desktop/", "Dockerfile", "render.yaml"],
    readme: [
      { h: "Why it exists", p: "A separate cloud deployment of Hermes Agent connected to the Jarvis web interface — so the local setup stays available, and the phone works while the PC is off.", li: ["Provider fallbacks: OpenRouter free pool → NVIDIA → Gemini.", "Research fuses Exa and Tavily rankings, Firecrawl as fallback.", "Workroom: 30+ ready-made workspaces that carry a brief and your documents."] },
      { h: "Replies that survive anything", p: "A small standard-library relay owns the public port and holds Hermes’s stream itself, numbering every event. A locked phone, a network switch or the five-minute Vercel limit only means picking the reply back up.", li: ["Cut-off replies continue from exactly where they stopped.", "At three minutes the model is told to stop gathering and write."] },
    ],
    log: [["feat(relay): resume streams from last event id", "4h"], ["feat(workroom): save any conversation as a workspace", "1d"], ["fix(research): collapse duplicate URLs across indexes", "2d"], ["feat(desktop): Tauri builds for macOS and Linux", "4d"], ["docs: capability release notes", "6d"]] },
  { repo: "grindtracker", name: "GrindTracker", pinned: true, lang: "TypeScript", commits: 343, days: 2, homepage: "grindtracker-nine.vercel.app", license: null,
    desc: null, auto: "A Next.js + Supabase app with Playwright end-to-end tests, deployed on Vercel.",
    topics: ["nextjs", "supabase", "playwright"],
    stack: ["Next.js", "TypeScript", "Supabase", "Playwright", "Vercel"],
    langs: [["TypeScript", 88], ["CSS", 7], ["PLpgSQL", 4], ["JavaScript", 1]],
    tree: ["src/", "e2e/", "supabase/migrations/", "public/", "scripts/", "docs/", "playwright.config.ts", "vercel.json"],
    readme: [{ h: "Auto-summary", p: "This repo’s README is still the create-next-app boilerplate, so this page was written from its structure: 343 commits, a Supabase schema, an e2e suite and a live Vercel deploy.", li: ["Add a description or a portfolio.md to override this summary."] }],
    log: [["feat(streaks): weekly goal rings", "1d"], ["test(e2e): onboarding happy path", "2d"], ["fix(auth): refresh session on focus", "4d"], ["feat(db): sessions table + RLS", "1w"], ["style: tighten dashboard spacing", "1w"]] },
  { repo: "websitebuilder", name: "Northframe", pinned: true, lang: "TypeScript", commits: 84, days: 4, homepage: "websitebuilder-ebon.vercel.app", license: "MIT",
    desc: "Site for a small web design studio: marketing pages, a project-request form, and a client portal with Stripe payments.",
    topics: ["nextjs", "stripe", "supabase", "tailwind"],
    stack: ["Next.js", "Tailwind v4", "Supabase", "Stripe", "Resend", "Vitest", "PostHog"],
    langs: [["TypeScript", 84], ["CSS", 13], ["PLpgSQL", 2], ["JavaScript", 1]],
    tree: ["src/app/(marketing)/", "src/app/(portal)/", "src/app/(concept)/", "src/config/", "src/lib/payments/", "src/styles/", "supabase/migrations/", "tests/"],
    readme: [
      { h: "The brief", p: "A public marketing site, a request form, and a portal where clients follow a project, give feedback on previews, and pay.", li: ["Three route groups: marketing, portal and concept sites.", "No browser writes to the database — every write is a checked server action."] },
      { h: "Money has one source", p: "Package prices live in one config file and become deposit and balance amounts in cents. Only verified Stripe webhooks mark a payment as paid.", li: ["Daily reconciliation job and duplicate-payment refunds.", "Colour tokens are light-dark() pairs with a WCAG contrast check in CI."] },
    ],
    log: [["feat(portal): preview feedback threads", "3d"], ["fix(stripe): idempotent webhook finalize", "5d"], ["feat(seo): sitemap + OG per guide", "1w"], ["chore: contrast check in CI", "2w"], ["feat(concept): two fictional client sites", "2w"]] },
  { repo: "calendar-ios", name: "Datebook iOS", lang: "Swift", commits: 61, days: 6, homepage: null, license: null,
    desc: "Native iOS shell for Datebook: reminders, home-screen widgets and Live Activities around the web app.",
    topics: ["ios", "swiftui", "widgetkit"], stack: ["Swift", "SwiftUI", "WidgetKit", "ActivityKit"], langs: [["Swift", 96], ["Shell", 4]],
    tree: ["Datebook/", "DatebookWidgets/", "DatebookLive/", "Shared/"],
    readme: [{ h: "Overview", p: "Loads the Datebook PWA in a WebView and adds the things only native can do.", li: ["Native reminders", "Widgets", "Live Activities"] }],
    log: [["feat(live): countdown activity for next class", "6d"], ["feat(widget): agenda medium widget", "2w"]] },
  { repo: "portfolio-sync", name: "Portfolio Sync", lang: "TypeScript", commits: 48, days: 0, homepage: null, license: null, sample: true,
    desc: "The scraper behind this site — pulls every repo, README, tree and screenshot nightly and rebuilds the pages.",
    topics: ["github-api", "scraper", "nextjs"], stack: ["Node", "GitHub REST", "Playwright", "Next.js ISR"], langs: [["TypeScript", 100]],
    tree: ["scrape/", "render/", "cron/"],
    readme: [{ h: "Pipeline", p: "Fetch repos → read README & package.json → screenshot homepage → generate art → publish.", li: [] }],
    log: [["feat: screenshot fallback chain", "0d"]] },
  { repo: "pixel-sort", name: "pixel-sort", lang: "Rust", commits: 37, days: 21, homepage: null, license: null, sample: true, desc: "Glitch-art pixel sorter that runs in the browser via WebAssembly.", topics: ["rust", "wasm", "generative"], stack: ["Rust", "wasm-bindgen"], langs: [["Rust", 82], ["JavaScript", 18]], tree: ["src/", "www/"], readme: [], log: [["perf: SIMD luminance pass", "3w"]] },
  { repo: "study-bot", name: "study-bot", lang: "JavaScript", commits: 52, days: 34, homepage: null, license: null, sample: true, desc: "Discord bot for study groups — pomodoro rooms, deadlines and streaks.", topics: ["discord", "bot"], stack: ["discord.js", "SQLite"], langs: [["JavaScript", 100]], tree: ["commands/", "events/"], readme: [], log: [["feat: /pomodoro rooms", "1mo"]] },
  { repo: "ml-notes", name: "ml-notes", lang: "Jupyter Notebook", commits: 29, days: 58, homepage: null, license: null, sample: true, desc: "Notebooks from working through ML fundamentals — from linear regression to tiny transformers.", topics: ["machine-learning", "pytorch"], stack: ["PyTorch", "NumPy"], langs: [["Jupyter Notebook", 90], ["Python", 10]], tree: ["notebooks/"], readme: [], log: [["add: attention from scratch", "2mo"]] },
  { repo: "chess-engine", name: "chess-engine", lang: "C++", commits: 74, days: 96, homepage: null, license: null, sample: true, desc: "Bitboard chess engine with alpha-beta search and a UCI interface.", topics: ["chess", "uci"], stack: ["C++20", "CMake"], langs: [["C++", 94], ["CMake", 6]], tree: ["src/", "tests/"], readme: [], log: [["feat: transposition table", "3mo"]] },
  { repo: "weather-cli", name: "weather-cli", lang: "Go", commits: 18, days: 140, homepage: null, license: null, sample: true, desc: "Fast terminal weather with sparkline forecasts.", topics: ["cli", "go"], stack: ["Go", "Cobra"], langs: [["Go", 100]], tree: ["cmd/"], readme: [], log: [["feat: hourly sparkline", "5mo"]] },
  { repo: "dotfiles", name: "dotfiles", lang: "Shell", commits: 112, days: 12, homepage: null, license: null, sample: true, desc: "Shell, editor and terminal setup, bootstrapped with one script.", topics: ["dotfiles"], stack: ["zsh", "Neovim"], langs: [["Shell", 70], ["Lua", 30]], tree: ["zsh/", "nvim/"], readme: [], log: [["tweak: prompt git status", "2w"]] },
];

const toLangs = (pairs: [string, number][]): Lang[] =>
  pairs.map(([n, v]) => ({ n, v, c: langColor(n), w: `${v}%` }));

const toTree = (paths: string[]): TreeEntry[] => paths.map((path) => ({ path, dir: path.endsWith("/") }));

const toLog = (repo: string, rows: [string, string][]): Commit[] =>
  rows.map(([msg, when], k) => ({ msg, when, sha: fakeSha(repo, k) }));

export const seedProject = (r: Raw): Project => ({
  slug: r.repo,
  repo: r.repo,
  name: r.name,
  desc: r.desc ?? r.auto ?? "",
  pinned: !!r.pinned,
  lang: r.lang,
  color: langColor(r.lang),
  commits: r.commits,
  days: r.days,
  updated: ago(r.days),
  homepage: r.homepage,
  license: r.license,
  topics: r.topics,
  stack: r.stack,
  langs: toLangs(r.langs),
  heat: heatmap(r.repo, r.days < 10 ? 0.75 : 0.4),
  log: toLog(r.repo, r.log),
  tree: toTree(r.tree),
  readme: r.readme,
  visual: screenshot(r.homepage) ?? (r.sample ? null : ogImage(r.repo)),
  og: r.sample ? null : ogImage(r.repo),
  url: GH + r.repo,
  sample: !!r.sample,
});

export const SEED_PROJECTS: Project[] = raw.map(seedProject);

export const SEED_USER: User = {
  name: "Sarvesh Jagtap",
  handle: HANDLE,
  avatar: "https://avatars.githubusercontent.com/u/65822915?v=4",
  repos: 27,
  commits: 1494,
  live: 6,
  synced: "recently",
  year: 2026,
  github: `https://github.com/${HANDLE}`,
};
