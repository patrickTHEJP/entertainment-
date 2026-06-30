import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear the cookie completely
  response.cookies.set({
    name: "token",
    value: "",
    path: "/",       // make sure it matches where the cookie was set
    maxAge: 0,       // expire immediately
    httpOnly: true,  // match the secure flag
  });

  return response;
}
