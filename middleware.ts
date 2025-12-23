import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  // Protect /dashboard
  if (url.pathname.startsWith("/dashboard")) {
    const session = req.cookies.get("session")?.value;
    if (!session) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};