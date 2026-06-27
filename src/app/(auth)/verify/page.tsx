import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { ResendVerification } from './resend-button'

export const metadata: Metadata = {
  title: 'Verify your email · AI Job Application Coach',
}

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          {email
            ? `We sent a verification link to ${email}. Click it to activate your account.`
            : 'We sent you a verification link. Click it to activate your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t get it? Check your spam folder, or resend the link below.
        </p>
        <ResendVerification email={email} />
      </CardContent>
      <CardFooter>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  )
}
