import type { User } from "@/lib/types";

// Placeholder until a real address is set; the design handoff used the same one.
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

export const Footer = ({ user }: { user: User }) => (
  <footer id="contact" className="mx-auto mt-[clamp(90px,10vw,140px)] max-w-[1280px] px-6 pb-10">
    <div className="grid gap-8 rounded-[32px] border-4 border-black bg-hot p-[clamp(32px,6vw,80px)] shadow-hard-2xl">
      <h2 className="m-0 font-display text-[clamp(44px,8vw,128px)] leading-[.88] tracking-[-.05em] uppercase">
        Let’s make<br />something.
      </h2>
      <div className="flex flex-wrap gap-3.5">
        <a
          href={`mailto:${EMAIL}`}
          className="rounded-[14px] border-3 border-black bg-black px-7 py-5 text-[17px] leading-none font-extrabold text-sun shadow-[5px_5px_0_#fff] transition-[translate,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_#fff]"
        >
          EMAIL ME
        </a>
        <a
          href={user.github}
          target="_blank"
          rel="noreferrer"
          className="rounded-[14px] border-3 border-black bg-white px-7 py-5 text-[17px] leading-none font-extrabold shadow-hard transition-[translate,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-xs"
        >
          github.com/{user.handle}
        </a>
      </div>
    </div>
    <div className="flex flex-wrap justify-between gap-2.5 px-1 pt-7 font-mono text-xs leading-[1.6] font-bold">
      <span>© {user.year} {user.name.toUpperCase()}</span>
      <span>AUTO-GENERATED FROM GITHUB · {user.synced}</span>
    </div>
  </footer>
);
