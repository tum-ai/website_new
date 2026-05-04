import { getJoinHostRedirectDestination } from "@/lib/redirects";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const redirectDestination = getJoinHostRedirectDestination(
    request.nextUrl.hostname,
    request.url,
  );

  if (redirectDestination) {
    return NextResponse.redirect(redirectDestination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
