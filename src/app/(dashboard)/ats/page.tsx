import { requireAuth } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { AtsForm } from '@/components/ats/AtsForm'

export default async function AtsPage() {
  const user = await requireAuth()

  const cvs = await prisma.cvDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, originalFileName: true },
  })
  const cvOptions = cvs.map((cv) => ({ id: cv.id, label: cv.originalFileName }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ATS Checker</h1>
        <p className="text-sm text-muted-foreground">
          See how well your CV matches a job description before you apply.
        </p>
      </div>

      <AtsForm cvOptions={cvOptions} />
    </div>
  )
}
