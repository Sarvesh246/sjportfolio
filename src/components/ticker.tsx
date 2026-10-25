const BASE = ["AI agents", "Open source", "Next.js", "TypeScript", "Supabase", "Python", "React", "PWAs"];
// Duplicated so translateX(0 → -50%) loops without a visible seam.
const ITEMS = [...BASE, ...BASE];

export const Ticker = () => (
  <div className="sticky top-0 z-50 overflow-hidden whitespace-nowrap border-b-[3px] border-black bg-black text-sun" aria-hidden="true">
    <div className="marquee-track flex w-max animate-marquee font-mono text-[13px] leading-none font-bold tracking-[.06em] uppercase">
      {ITEMS.map((t, i) => (
        <span key={i} className="px-[22px] py-2.5">★ {t}</span>
      ))}
    </div>
  </div>
);
