import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

// Pages stay static and cacheable; the client asks this route who's looking.
export async function GET() {
  return NextResponse.json({ admin: await isAdmin() }, { headers: { "Cache-Control": "private, no-store" } });
}
