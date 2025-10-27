import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Authentication temporarily disabled for all routes
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// ✅ Keep matcher so middleware runs without blocking anything
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
