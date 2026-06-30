import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretkey"
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Public routes
  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/products") ||
    req.nextUrl.pathname.startsWith("/booking")
  ) {
    return NextResponse.next();
  }

  // If no token, redirect
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const verifiedToken = await jwtVerify(token, JWT_SECRET);

    // Check if accessing admin route
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const payload = verifiedToken.payload as {
        id: number;
        email?: string;
        role?: string;
      };
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url)); // Redirect non-admins
      }
    }

    return NextResponse.next(); // token valid
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/booking/:path*",
    "/products/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
