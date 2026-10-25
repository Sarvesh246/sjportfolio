"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const btn =
  "rounded-lg border-3 border-black bg-white px-3.5 py-2.5 font-mono text-xs leading-none font-bold shadow-hard-xs transition-colors hover:bg-sun disabled:opacity-50";

/** Owner-only controls. Renders nothing for visitors, so the page itself stays static and cacheable. */
export const AdminPanel = ({ slug, custom }: { slug: string; custom: boolean }) => {
  const router = useRouter();
  const [admin, setAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ admin: boolean }>)
      .then((m) => live && setAdmin(m.admin))
      .catch(() => {});
    return () => { live = false; };
  }, []);

  if (!admin) return null;

  const call = async (url: string, init: RequestInit) => {
    const res = await fetch(url, init);
    const body = (await res.json().catch(() => ({}))) as { error?: string; live?: boolean; screenshotRefreshed?: boolean };
    if (!res.ok) throw new Error(body.error ?? `Failed (${res.status})`);
    return body;
  };

  const refresh = async () => {
    setBusy(true);
    setMsg("Re-scraping…");
    try {
      const body = await call("/api/admin/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
      setMsg(
        !body.live
          ? "GitHub didn’t answer (usually its 60/hour anonymous limit), so this is still saved data. Set GITHUB_TOKEN and try again."
          : body.screenshotRefreshed ? "Refreshed, new screenshot taken." : "Refreshed. (No screenshot to retake, or Microlink is rate-limited.)",
      );
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAdmin(false);
  };

  return (
    <div className="mt-[34px] flex flex-wrap items-center gap-3 rounded-2xl border-3 border-dashed border-black bg-white p-4">
      <span className="nb-label">Owner</span>
      <button className={btn} disabled={busy} onClick={refresh}>
        {busy ? "REFRESHING…" : "↻ REFRESH THIS PROJECT"}
      </button>
      <button className={`${btn} ml-auto`} onClick={signOut}>SIGN OUT</button>
      <span className="w-full font-mono text-xs font-bold" role="status">
        {msg || (custom
          ? `Using public/thumbnails/${slug}.* from the repo. Replace the file and push to change it.`
          : `To use your own thumbnail, add public/thumbnails/${slug}.png to the repo and push.`)}
      </span>
    </div>
  );
};
