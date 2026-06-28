import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { requireAuth } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { CoverLetterForm } from '@/components/cover-letter/CoverLetterForm'

export default async function NewCoverLetterPage({
  searchParams,
}: {
  searchParams: { cv?: string }
}) {
  const user = await requireAuth()

  const cvs = await prisma.cvDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, originalFileName: true },
  })
  const cvOptions = cvs.map((cv) => ({ id: cv.id, label: cv.originalFileName }))
  const initialCvId =
    searchParams.cv && cvs.some((cv) => cv.id === searchParams.cv) ? searchParams.cv : undefined

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
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New cover letter</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the role and paste the job description — we&apos;ll do the rest.
        </p>
      </div>

      <CoverLetterForm cvOptions={cvOptions} initialCvId={initialCvId} />
    </div>
  )
}
