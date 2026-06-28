import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { checkUsageLimit, incrementUsage } from '@/lib/db/usage'
import { rateLimit } from '@/lib/utils/rate-limit'
import { normalizeWhitespace, stripHtml } from '@/lib/utils/text'
import { generateCoverLetter } from '@/lib/ai/service'
import { AiServiceError } from '@/lib/ai/errors'
import { coverLetterSchema } from '@/lib/validations/cover-letter'

export const runtime = 'nodejs'
export const maxDuration = 60

const NO_CV_CONTEXT =
  '(No CV was provided. Write a strong, professional cover letter tailored to the job description. Keep claims general and do NOT invent specific employers, job titles, dates, or metrics.)'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limit = rateLimit(`cover-letter:${user.id}`, 10, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a little while.' },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = coverLetterSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Invalid request.'
      return NextResponse.json({ error: first }, { status: 400 })
    }
    const { jobTitle, companyName, jobDescription, tone, cvDocumentId } = parsed.data

    const usage = await checkUsageLimit(user.id, 'COVER_LETTER')
    if (!usage.allowed) {
      return NextResponse.json(
        { error: usage.reason ?? 'Usage limit reached.', code: 'usage_limit', remaining: usage.remaining ?? 0 },
        { status: 403 },
      )
    }

    // Resolve CV context. Only link/use a CV that belongs to the user; an
    // invalid or someone else's id falls back to the default context (no error).
    let cvSummary = NO_CV_CONTEXT
    let linkedCvId: string | null = null
    const candidateCvId =
      cvDocumentId && z.string().uuid().safeParse(cvDocumentId).success ? cvDocumentId : null
    if (candidateCvId) {
      const doc = await prisma.cvDocument.findUnique({
        where: { id: candidateCvId },
        select: { userId: true, optimizedContent: true, originalContent: true },
      })
      if (doc && doc.userId === user.id) {
        cvSummary = doc.optimizedContent ?? doc.originalContent
        linkedCvId = candidateCvId
      }
    }

    const cleanJobDescription = normalizeWhitespace(stripHtml(jobDescription))

    let content: string
    try {
      content = await generateCoverLetter({
        jobTitle,
        companyName: companyName || undefined,
        jobDescription: cleanJobDescription,
        cvSummary,
        tone,
        userLanguage: user.language,
      })
    } catch (error) {
      const message =
        error instanceof AiServiceError ? error.message : 'Cover letter generation failed.'
      console.error('[cover-letter/generate] ai', error)
      return NextResponse.json({ error: message }, { status: 502 })
    }

    const record = await prisma.coverLetter.create({
      data: {
        userId: user.id,
        cvDocumentId: linkedCvId,
        companyName: companyName || null,
        jobTitle,
        jobDescription: cleanJobDescription,
        tone,
        generatedContent: content,
      },
      select: { id: true, generatedContent: true },
    })
    await incrementUsage(user.id, 'COVER_LETTER')

    return NextResponse.json({ data: { id: record.id, content: record.generatedContent } })
  } catch (error) {
    console.error('[cover-letter/generate]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
