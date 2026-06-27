import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js'
import type { User as DbUser } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { ensureUserProvisioned } from '@/lib/db/user'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Supabase client for Server Components and Route Handlers. Reads/writes the
 * session cookies via Next's cookie store. In a Server Component the cookie
 * store is read-only, so `setAll` is wrapped in try/catch — the middleware is
 * responsible for refreshing the session cookie on the response.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
    },
  })
}

/**
 * The current app user, or null if not authenticated. Uses `getUser()` which
 * verifies the JWT with Supabase (never trust the cookie blindly). Lazily
 * provisions the app User + FREE Subscription rows on first authenticated access.
 */
export async function getCurrentUser(): Promise<DbUser | null> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const existing = await prisma.user.findUnique({ where: { id: user.id } })
  if (existing) return existing

  return ensureUserProvisioned({
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.name as string | undefined) ?? null,
  })
}

/** Like getCurrentUser but redirects to /login when there is no session. */
export async function requireAuth(): Promise<DbUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Admin client using the service-role key. SERVER ONLY — bypasses RLS.
 * Use for privileged operations (e.g. webhook-driven mutations), never in
 * response to unauthenticated input.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  return createSupabaseJsClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
