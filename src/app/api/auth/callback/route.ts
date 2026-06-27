import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth/server'
import { ensureUserProvisioned } from '@/lib/db/user'

/**
 * Supabase email-confirmation / OAuth callback.
 * Exchanges the `code` for a session, provisions the app User + FREE
 * Subscription (id taken from the verified session — never the client), then
 * redirects to `next` (default /dashboard).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  try {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchange', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth`)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Failing to provision should not block login — log and continue;
      // getCurrentUser() will retry provisioning on the next request.
      try {
        await ensureUserProvisioned({
          id: user.id,
          email: user.email ?? '',
          name: (user.user_metadata?.name as string | undefined) ?? null,
        })
      } catch (provisionError) {
        console.error('[auth/callback] provision', provisionError)
      }
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (error) {
    console.error('[auth/callback]', error)
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }
}

function sanitizeNext(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  return '/dashboard'
}
