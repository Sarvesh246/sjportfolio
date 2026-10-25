import Link from "next/link";

export const Nav = () => (
  <nav className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-6 pt-[22px]">
    <Link
      href="/"
      className="nb-link mr-auto bg-sun font-display text-[22px] tracking-[-.03em] max-sm:basis-full max-sm:text-center"
      style={{ font: "400 22px/1 var(--font-display)", padding: "10px 16px" }}
    >
      SARVESH<span className="text-hot">!</span>
    </Link>
    <Link href="/#work" className="nb-link hover:bg-sky">Work</Link>
    <Link href="/#all" className="nb-link hover:bg-mint">All repos</Link>
    <Link href="#contact" className="nb-link bg-hot">Hire me →</Link>
  </nav>
);
