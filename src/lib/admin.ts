import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sj_admin";
const MAX_AGE_S = 60 * 60 * 24 * 14;

// The password is the only secret. ADMIN_SECRET is optional and only changes what signs the cookie,
// so rotating it logs everyone (you) out without changing the password.
const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;

export const checkPassword = (attempt: string) => adminConfigured() && safeEqual(attempt, process.env.ADMIN_PASSWORD!);

/** Cookie value: `<expiry>.<hmac(expiry)>`. Nothing in it identifies a user; it only proves the password was known. */
export const makeSessionValue = () => {
  const exp = String(Date.now() + MAX_AGE_S * 1000);
  return `${exp}.${sign(exp)}`;
};

export const sessionCookieOptions = { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE_S } as const;

export const isAdmin = async (): Promise<boolean> => {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const [exp, mac] = value.split(".");
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  return safeEqual(mac, sign(exp));
};
