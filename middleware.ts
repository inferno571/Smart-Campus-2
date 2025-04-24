import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if we're accessing the environment variables page
  if (request.nextUrl.pathname === "/settings/env") {
    // We could add additional checks here if needed
    return NextResponse.next()
  }

  // Continue with the request
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/settings/env"],
}
