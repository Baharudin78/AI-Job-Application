'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout(): Promise<void> {
    setLoading(true)
    try {
      await createSupabaseClient().auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={logout} disabled={loading}>
      {loading ? 'Logging out…' : 'Log out'}
    </Button>
  )
}
