import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { Project } from "./types";

// Drop an image at public/thumbnails/<repo-name>.png (or .jpg/.webp/.gif/.avif) and push. It ships with the
// site, so there's no upload API, no storage bill, and nothing for a visitor to attack.
const DIR = path.join(process.cwd(), "public", "thumbnails");
const IMAGE = /\.(png|jpe?g|webp|gif|avif)$/i;

/** slug -> URL of the thumbnail committed to the repo. Empty when the folder doesn't exist. */
export const getThumbnails = async (): Promise<Record<string, string>> => {
  "use cache";
  cacheLife("hours");
  try {
    const out: Record<string, string> = {};
    for (const file of await readdir(DIR)) {
      if (!IMAGE.test(file)) continue;
      const { mtimeMs } = await stat(path.join(DIR, file));
      // `v` busts browser/CDN caches when the file is swapped for a new one at the same name.
      out[file.replace(IMAGE, "")] = `/thumbnails/${encodeURIComponent(file)}?v=${Math.floor(mtimeMs)}`;
    }
    return out;
  } catch {
    return {};
  }
};

export const withThumbnails = <T extends Project>(projects: T[], thumbs: Record<string, string>): T[] =>
  projects.map((p) => (thumbs[p.slug] ? { ...p, visual: thumbs[p.slug], custom: true } : p));
