import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkPassword, makeSessionValue, sessionCookieOptions } from "@/lib/admin";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD isn't set on the server." }, { status: 503 });
  }
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 600)); // blunt brute-force speed bump
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSessionValue(), sessionCookieOptions);
  return res;
}
