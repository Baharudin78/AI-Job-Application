import Link from 'next/link'
import { Mail, Plus } from 'lucide-react'

import { requireAuth } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TONE_LABELS } from '@/lib/validations/cover-letter'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default async function CoverLetterPage() {
  const user = await requireAuth()
  const letters = await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, jobTitle: true, companyName: true, tone: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cover Letters</h1>
          <p className="text-sm text-muted-foreground">
            Generate tailored cover letters in professional English.
          </p>
        </div>
        <Button asChild>
          <Link href="/cover-letter/new">
            <Plus className="size-4" />
            New cover letter
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your cover letters</CardTitle>
        </CardHeader>
        <CardContent>
          {letters.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Mail className="size-5 text-muted-foreground" />
              </span>
              <div>
                <p className="font-medium">No cover letters yet</p>
                <p className="text-sm text-muted-foreground">
                  Generate your first one tailored to a job description.
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/cover-letter/new">
                  <Plus className="size-4" />
                  New cover letter
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {letters.map((letter) => (
                <li key={letter.id}>
                  <Link
                    href={`/cover-letter/${letter.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-accent"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Mail className="size-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {letter.jobTitle}
                        {letter.companyName ? ` · ${letter.companyName}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(letter.createdAt)}</p>
                    </div>
                    <Badge variant="secondary">{TONE_LABELS[letter.tone].label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
