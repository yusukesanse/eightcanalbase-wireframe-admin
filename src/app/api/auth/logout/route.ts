import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout
 * セッション Cookie を削除してログアウトする。
 */
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("__session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
