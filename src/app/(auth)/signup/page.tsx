import type { Metadata } from 'next'
import { SignupForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Sign up · AI Job Application Coach',
}

export default function SignupPage() {
  return <SignupForm />
}
