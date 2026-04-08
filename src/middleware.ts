import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === "join.tum-ai.com") {
    return NextResponse.redirect(new URL("/apply", request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
