import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Owner sign-in", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-[520px] px-6 pt-[clamp(48px,8vw,110px)]">
      <div className="grid gap-5 rounded-3xl border-4 border-black bg-sky p-[clamp(24px,4vw,40px)] shadow-hard-xl">
        <h1 className="m-0 font-display text-[clamp(34px,6vw,52px)] leading-none tracking-[-.04em] uppercase">Owner sign-in</h1>
        <p className="m-0 text-base leading-normal font-medium">Unlocks the “refresh this project” button on each project page. Visitors never see it.</p>
        <LoginForm />
      </div>
    </main>
  );
}
