'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ResendVerification({ email }: { email?: string }) {
  const [status, setStatus] = useState<Status>('idle')

  async function resend(): Promise<void> {
    if (!email) return
    setStatus('sending')
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      setStatus(error ? 'error' : 'sent')
    } catch {
      setStatus('error')
    }
  }

  if (!email) {
    return (
      <p className="text-sm text-muted-foreground">
        Head back to{' '}
        <a href="/signup" className="underline">
          sign up
        </a>{' '}
        to request a new link.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={resend}
        disabled={status === 'sending' || status === 'sent'}
      >
        {status === 'sent'
          ? 'Email sent'
          : status === 'sending'
            ? 'Sending…'
            : 'Resend verification email'}
      </Button>
      {status === 'error' && (
        <p className="text-sm text-destructive">Could not resend right now. Try again shortly.</p>
      )}
    </div>
  )
}
