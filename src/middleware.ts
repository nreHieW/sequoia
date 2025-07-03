import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that can be accessed without authentication
const PUBLIC_PATHS = [
  "/login",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  // Allow public paths without auth
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If the auth cookie is set, allow the request to continue
  const authCookie = request.cookies.get("auth");
  if (authCookie?.value === "true") {
    return NextResponse.next();
  }

  // Otherwise, redirect to the login page
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

// Apply the middleware to every route
export const config = {
  matcher: "/:path*",
}; 