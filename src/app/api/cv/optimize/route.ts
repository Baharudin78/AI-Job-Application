import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { checkUsageLimit, incrementUsage } from '@/lib/db/usage'
import { rateLimit } from '@/lib/utils/rate-limit'
import { optimizeCv } from '@/lib/ai/service'
import { AiServiceError } from '@/lib/ai/errors'

export const runtime = 'nodejs'
export const maxDuration = 60

const schema = z.object({
  documentId: z.string().uuid(),
  targetJobTitle: z.string().trim().max(100).optional(),
  targetIndustry: z.string().trim().max(100).optional(),
  /** Required to re-optimize a CV that is already DONE. */
  force: z.boolean().optional(),
})

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Authenticate
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Rate limit (10/hour/user)
    const limit = rateLimit(`cv-optimize:${user.id}`, 10, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a little while.' },
        { status: 429 },
      )
    }

    // 3. Validate input
    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }
    const { documentId, targetJobTitle, targetIndustry, force } = parsed.data

    // 4. Fetch + authorize the document
    const document = await prisma.cvDocument.findUnique({ where: { id: documentId } })
    if (!document) {
      return NextResponse.json({ error: 'CV not found.' }, { status: 404 })
    }
    if (document.userId !== user.id) {
      // Don't claim "not found" — but don't reveal content either.
      return NextResponse.json({ error: 'You do not have access to this CV.' }, { status: 403 })
    }

    // 5. Status guards
    if (document.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'This CV is already being optimized. Please wait a moment.' },
        { status: 409 },
      )
    }
    if (document.status === 'DONE' && !force) {
      return NextResponse.json({ error: 'already_optimized' }, { status: 409 })
    }

    // 6. Usage limit
    const usage = await checkUsageLimit(user.id, 'CV_OPTIMIZE')
    if (!usage.allowed) {
      return NextResponse.json(
        { error: usage.reason ?? 'Usage limit reached.', code: 'usage_limit', remaining: usage.remaining ?? 0 },
        { status: 403 },
      )
    }

    // 7. Mark PROCESSING (persist any new target context)
    await prisma.cvDocument.update({
      where: { id: document.id },
      data: {
        status: 'PROCESSING',
        errorMessage: null,
        ...(targetJobTitle !== undefined ? { targetJobTitle } : {}),
        ...(targetIndustry !== undefined ? { targetIndustry } : {}),
      },
    })

    // 8. Run the AI optimization
    let optimized: string
    try {
      optimized = await optimizeCv({
        originalCv: document.originalContent,
        targetJobTitle: targetJobTitle ?? document.targetJobTitle ?? undefined,
        targetIndustry: targetIndustry ?? document.targetIndustry ?? undefined,
        userLanguage: user.language,
      })
    } catch (error) {
      const message =
        error instanceof AiServiceError
          ? error.message
          : 'CV optimization failed. Please try again.'
      console.error('[cv/optimize] ai', error)
      await prisma.cvDocument.update({
        where: { id: document.id },
        data: { status: 'FAILED', errorMessage: message },
      })
      return NextResponse.json({ error: message }, { status: 502 })
    }

    // 9. Persist result + track usage
    await prisma.cvDocument.update({
      where: { id: document.id },
      data: { status: 'DONE', optimizedContent: optimized, errorMessage: null },
    })
    await incrementUsage(user.id, 'CV_OPTIMIZE')

    return NextResponse.json({
      data: { id: document.id, status: 'DONE', optimizedContent: optimized },
    })
  } catch (error) {
    console.error('[cv/optimize]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
