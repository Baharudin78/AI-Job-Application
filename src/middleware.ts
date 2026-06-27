import { NextResponse, type NextRequest } from 'next/server'

/**
 * PLACEHOLDER middleware (Session 0.1 — Foundation).
 *
 * In Session 0.3 (Authentication) this is replaced with Supabase SSR session
 * handling: refresh the auth session on every request, protect the
 * `/(dashboard)` route group, and redirect authenticated users away from
 * `/login` and `/signup`. For now it is a pass-through so the app boots.
 *
 * See: Claude Code Guide.md → Session 0.3
 */
export function middleware(_request: NextRequest): NextResponse {
  return NextResponse.next()
}

export const config = {
  /**
   * Run on all request paths except Next.js internals and static assets.
   * Already shaped for the auth middleware added in Session 0.3.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
