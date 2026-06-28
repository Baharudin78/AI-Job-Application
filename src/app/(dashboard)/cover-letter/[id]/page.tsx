import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { requireAuth } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { TONE_LABELS } from '@/lib/validations/cover-letter'
import { CoverLetterResult } from '@/components/cover-letter/CoverLetterResult'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'cover-letter'
  )
}

export default async function CoverLetterDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth()

  const letter = await prisma.coverLetter.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      jobTitle: true,
      companyName: true,
      tone: true,
      generatedContent: true,
      createdAt: true,
    },
  })

  if (!letter || letter.userId !== user.id) notFound()

  const fileBaseName = `${slugify(letter.jobTitle)}-cover-letter`

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/cover-letter"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to cover letters
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {letter.jobTitle}
          {letter.companyName ? ` · ${letter.companyName}` : ''}
        </h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{TONE_LABELS[letter.tone].label}</Badge>
          <span>{formatDate(letter.createdAt)}</span>
        </div>
      </div>

      <CoverLetterResult
        coverLetterId={letter.id}
        content={letter.generatedContent}
        fileBaseName={fileBaseName}
        showDelete
      />
    </div>
  )
}
