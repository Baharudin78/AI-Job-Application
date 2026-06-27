import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Log in · AI Job Application Coach',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string }
}) {
  const initialError =
    searchParams.error === 'auth'
      ? 'We could not verify your session. Please log in again.'
      : undefined

  return <LoginForm redirectTo={searchParams.redirect} initialError={initialError} />
}
