import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { requireAuth } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { CvOptimizer } from '@/components/cv/CvOptimizer'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default async function CvDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth()

  const document = await prisma.cvDocument.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      originalFileName: true,
      status: true,
      originalContent: true,
      optimizedContent: true,
      targetJobTitle: true,
      targetIndustry: true,
      errorMessage: true,
      createdAt: true,
    },
  })

  // 404 for both missing and not-owned — never reveal another user's document.
  if (!document || document.userId !== user.id) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/cv"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to CVs
        </Link>
        <h1 className="mt-2 truncate text-2xl font-bold tracking-tight">{document.originalFileName}</h1>
        <p className="text-sm text-muted-foreground">Uploaded {formatDate(document.createdAt)}</p>
      </div>

      <CvOptimizer
        document={{
          id: document.id,
          originalFileName: document.originalFileName,
          status: document.status,
          originalContent: document.originalContent,
          optimizedContent: document.optimizedContent,
          targetJobTitle: document.targetJobTitle,
          targetIndustry: document.targetIndustry,
          errorMessage: document.errorMessage,
        }}
      />
    </div>
  )
}
