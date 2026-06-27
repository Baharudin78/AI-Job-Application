import { createBrowserClient } from '@supabase/ssr'

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>

let client: SupabaseBrowserClient | undefined

/**
 * Supabase client for Client Components. Cached as a singleton so the whole
 * browser session shares one instance (and one auth state listener).
 */
export function createSupabaseClient(): SupabaseBrowserClient {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return client
}
