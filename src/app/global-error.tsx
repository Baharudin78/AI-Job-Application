'use client'

import { useEffect } from 'react'

// Replaces the root layout when an error happens above it, so it cannot rely on
// the app's CSS — uses inline styles only.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global-error]', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          margin: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: '0.5rem', color: '#71717a' }}>
            A critical error occurred. Please reload the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              background: '#18181b',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
