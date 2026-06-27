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

export const metadata: Metadata = {
  title: 'Reset password · AI Job Application Coach',
}

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>Password reset is coming soon.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This flow isn&apos;t built yet. For now, please reach out to support if you&apos;re
          locked out of your account.
        </p>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  )
}
