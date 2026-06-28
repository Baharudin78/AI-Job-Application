import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { success, error } from '@/lib/utils/api-response'
import { AuthError, ValidationError } from '@/lib/utils/errors'

export const runtime = 'nodejs'

const schema = z.object({
  targetJobTitle: z.string().trim().max(100).optional(),
  targetIndustry: z.string().trim().max(100).optional(),
  language: z.enum(['en', 'id', 'tl', 'hi', 'es', 'pt', 'vi']).optional(),
  /** When true, marks onboarding finished. */
  complete: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new AuthError()

    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid request.')
    }
    const d = parsed.data

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(d.targetJobTitle !== undefined ? { targetJobTitle: d.targetJobTitle || null } : {}),
        ...(d.targetIndustry !== undefined ? { targetIndustry: d.targetIndustry || null } : {}),
        ...(d.language ? { language: d.language } : {}),
        ...(d.complete ? { onboardingCompletedAt: new Date() } : {}),
      },
    })

    return success({ ok: true })
  } catch (err) {
    console.error('[api/onboarding]', err)
    return error(err)
  }
}
