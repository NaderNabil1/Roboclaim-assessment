import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN = "rc_token";
const ROLE = "rc_role";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN)?.value;
  const role = request.cookies.get(ROLE)?.value;

  if (pathname === "/") {
    if (token) {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin/reports" : "/claims";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/claims", request.url));
    }
  }

  if (pathname.startsWith("/claims")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/reports", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/claims",
    "/claims/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
