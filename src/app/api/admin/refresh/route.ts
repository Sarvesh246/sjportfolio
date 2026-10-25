import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { PORTFOLIO_TAG, getPortfolio, projectTag } from "@/lib/github";
import { screenshot } from "@/lib/seed";

const SLUG_RE = /^[A-Za-z0-9._-]{1,100}$/;

/** Owner-only: expire everything cached for one project, re-scrape it now, and re-take its screenshot. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { slug?: unknown } | null;
  const slug = body?.slug;
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) return NextResponse.json({ error: "Bad project slug." }, { status: 400 });

  // expire: 0 drops the entries now instead of serving them stale while revalidating.
  // The repo list (description, homepage, last push) is shared, so it goes too; it's only two API calls.
  revalidateTag(projectTag(slug), { expire: 0 });
  revalidateTag(PORTFOLIO_TAG, { expire: 0 });

  const { projects, live } = await getPortfolio(); // re-scrapes and warms the cache
  const project = projects.find((p) => p.slug === slug);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  // Microlink keeps screenshots ~24h; force=true makes it retake this one. Best effort: a failure
  // (rate limit, site down) shouldn't undo the refresh.
  let screenshotRefreshed = false;
  const shot = project.visual && project.homepage ? screenshot(project.homepage) : null;
  if (shot) {
    screenshotRefreshed = await fetch(`${shot}&force=true`, { signal: AbortSignal.timeout(25_000) })
      .then((r) => r.ok && (r.headers.get("content-type") ?? "").startsWith("image/"))
      .catch(() => false);
  }

  return NextResponse.json({ ok: true, live, screenshotRefreshed });
}
