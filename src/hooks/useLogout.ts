'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/auth/client'

/** Sign the user out and send them to /login. */
export function useLogout(): { logout: () => Promise<void>; loading: boolean } {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await createSupabaseClient().auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setLoading(false)
    }
  }, [router])

  return { logout, loading }
}
