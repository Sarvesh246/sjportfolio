"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password");
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.push("/");
      router.refresh();
      return;
    }
    const body = (await res?.json().catch(() => null)) as { error?: string } | null;
    setError(body?.error ?? "Couldn’t reach the server.");
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-3.5">
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        aria-label="Password"
        placeholder="Password"
        className="rounded-[14px] border-3 border-black bg-white px-[18px] py-4 text-base font-semibold shadow-hard-md outline-none focus:bg-[#fffbe6]"
      />
      <button
        disabled={busy}
        className="rounded-xl border-3 border-black bg-black px-[22px] py-4 text-[15px] leading-none font-extrabold text-sun shadow-[4px_4px_0_#fff] transition-[translate,box-shadow] duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#fff] disabled:opacity-60"
      >
        {busy ? "CHECKING…" : "SIGN IN"}
      </button>
      {error && <p role="alert" className="m-0 font-mono text-xs font-bold">{error}</p>}
    </form>
  );
};
