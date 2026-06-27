import { prisma } from './client'

export type ActivityType = 'CV' | 'COVER_LETTER' | 'ATS'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  createdAt: Date
}

export interface DashboardData {
  counts: {
    cvDocuments: number
    coverLetters: number
    atsChecks: number
  }
  recentActivity: ActivityItem[]
}

/** Summary counts + the 5 most recent items across all features for a user. */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [cvCount, coverLetterCount, atsCount, cvs, coverLetters, atsChecks] = await Promise.all([
    prisma.cvDocument.count({ where: { userId } }),
    prisma.coverLetter.count({ where: { userId } }),
    prisma.atsCheck.count({ where: { userId } }),
    prisma.cvDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, originalFileName: true, createdAt: true },
    }),
    prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, jobTitle: true, companyName: true, createdAt: true },
    }),
    prisma.atsCheck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, score: true, createdAt: true },
    }),
  ])

  const recentActivity: ActivityItem[] = [
    ...cvs.map((cv) => ({
      id: cv.id,
      type: 'CV' as const,
      title: cv.originalFileName,
      createdAt: cv.createdAt,
    })),
    ...coverLetters.map((cl) => ({
      id: cl.id,
      type: 'COVER_LETTER' as const,
      title: cl.companyName ? `${cl.jobTitle} · ${cl.companyName}` : cl.jobTitle,
      createdAt: cl.createdAt,
    })),
    ...atsChecks.map((ats) => ({
      id: ats.id,
      type: 'ATS' as const,
      title: `ATS match — score ${ats.score}`,
      createdAt: ats.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  return {
    counts: {
      cvDocuments: cvCount,
      coverLetters: coverLetterCount,
      atsChecks: atsCount,
    },
    recentActivity,
  }
}
