import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { checkUsageLimit, incrementUsage } from '@/lib/db/usage'
import { rateLimit } from '@/lib/utils/rate-limit'
import { normalizeWhitespace, stripHtml } from '@/lib/utils/text'
import { checkAts } from '@/lib/ai/service'
import { AiServiceError } from '@/lib/ai/errors'
import { atsCheckSchema, ATS_SHORT_THRESHOLD, MAX_ATS_CV, MAX_ATS_JD } from '@/lib/validations/ats'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limit = rateLimit(`ats:${user.id}`, 10, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a little while.' },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = atsCheckSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }
    const { cvContent, cvDocumentId, jobDescription } = parsed.data

    const usage = await checkUsageLimit(user.id, 'ATS_CHECK')
    if (!usage.allowed) {
      return NextResponse.json(
        { error: usage.reason ?? 'Usage limit reached.', code: 'usage_limit', remaining: usage.remaining ?? 0 },
        { status: 403 },
      )
    }

    // Resolve CV text — a chosen CV must belong to the user.
    let cvText = ''
    if (cvDocumentId) {
      const doc = await prisma.cvDocument.findUnique({
        where: { id: cvDocumentId },
        select: { userId: true, optimizedContent: true, originalContent: true },
      })
      if (!doc || doc.userId !== user.id) {
        return NextResponse.json({ error: 'CV not found.' }, { status: 404 })
      }
      cvText = doc.optimizedContent ?? doc.originalContent
    } else if (cvContent) {
      cvText = cvContent
    }

    cvText = normalizeWhitespace(stripHtml(cvText))
    const cleanJobDescription = normalizeWhitespace(stripHtml(jobDescription))
    if (!cvText) {
      return NextResponse.json({ error: 'Paste your CV text or choose a saved CV.' }, { status: 400 })
    }

    let result
    try {
      result = await checkAts({ cvContent: cvText, jobDescription: cleanJobDescription })
    } catch (error) {
      const message = error instanceof AiServiceError ? error.message : 'ATS analysis failed.'
      console.error('[ats/check] ai', error)
      return NextResponse.json({ error: message }, { status: 502 })
    }

    await prisma.atsCheck.create({
      data: {
        userId: user.id,
        cvContent: cvText.slice(0, MAX_ATS_CV),
        jobDescription: cleanJobDescription.slice(0, MAX_ATS_JD),
        score: result.score,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        suggestions: JSON.stringify({ summary: result.summary, suggestions: result.suggestions }),
      },
    })
    await incrementUsage(user.id, 'ATS_CHECK')

    const warnings: string[] = []
    if (cvText.length < ATS_SHORT_THRESHOLD) {
      warnings.push('Your CV text is very short — results may be unreliable.')
    }
    if (cleanJobDescription.length < ATS_SHORT_THRESHOLD) {
      warnings.push('The job description is short or generic — the score may not be meaningful.')
    }

    return NextResponse.json({
      data: { ...result, warning: warnings.length ? warnings.join(' ') : undefined },
    })
  } catch (error) {
    console.error('[ats/check]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
