export type Lang = { n: string; v: number; c: string; w: string };
export type Commit = { msg: string; when: string; sha: string };
export type TreeEntry = { path: string; dir: boolean };
export type ReadmeSection = { h: string; p: string; li: string[] };

export type Project = {
  slug: string;
  repo: string;
  name: string;
  desc: string;
  pinned: boolean;
  lang: string;
  color: string;
  commits: number;
  days: number;
  updated: string;
  homepage: string | null;
  license: string | null;
  topics: string[];
  stack: string[];
  langs: Lang[];
  heat: number[];
  log: Commit[];
  tree: TreeEntry[];
  readme: ReadmeSection[];
  visual: string | null;
  og: string | null;
  url: string;
  sample: boolean;
  /** True when `visual` is a thumbnail the owner uploaded. */
  custom?: boolean;
};

export type User = {
  name: string;
  handle: string;
  avatar: string;
  repos: number;
  commits: number;
  live: number;
  synced: string;
  year: number;
  github: string;
};

export type Portfolio = { user: User; projects: Project[]; live: boolean };

export type Status = "Deployed" | "Active" | "Dormant";
