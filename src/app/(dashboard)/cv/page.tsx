import Link from 'next/link'
import { FileText } from 'lucide-react'
import type { DocumentStatus } from '@prisma/client'

import { requireAuth } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { FileUpload } from '@/components/cv/FileUpload'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STATUS_META: Record<
  DocumentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  UPLOADED: { label: 'Uploaded', variant: 'secondary' },
  PROCESSING: { label: 'Processing', variant: 'outline' },
  DONE: { label: 'Optimized', variant: 'default' },
  FAILED: { label: 'Failed', variant: 'destructive' },
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function CvPage() {
  const user = await requireAuth()
  const documents = await prisma.cvDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, originalFileName: true, status: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CV Optimizer</h1>
        <p className="text-sm text-muted-foreground">
          Upload your CV and we&apos;ll rewrite it in professional English.
        </p>
      </div>

      <FileUpload />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your CVs</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No CVs yet — upload one above to get started.
            </p>
          ) : (
            <ul className="divide-y">
              {documents.map((doc) => {
                const meta = STATUS_META[doc.status]
                return (
                  <li key={doc.id}>
                    <Link
                      href={`/cv/${doc.id}`}
                      className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-accent"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileText className="size-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.originalFileName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                      </div>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
