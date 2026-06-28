import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'

export const runtime = 'nodejs'

const patchSchema = z.object({
  content: z.string().trim().min(1, 'Cover letter cannot be empty').max(20000),
})

async function authorize(id: string): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const record = await prisma.coverLetter.findUnique({ where: { id }, select: { userId: true } })
  if (!record) {
    return { ok: false, response: NextResponse.json({ error: 'Cover letter not found.' }, { status: 404 }) }
  }
  if (record.userId !== user.id) {
    return { ok: false, response: NextResponse.json({ error: 'You do not have access to this cover letter.' }, { status: 403 }) }
  }
  return { ok: true }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const auth = await authorize(params.id)
    if (!auth.ok) return auth.response

    const body = await request.json().catch(() => null)
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
    }

    const updated = await prisma.coverLetter.update({
      where: { id: params.id },
      data: { generatedContent: parsed.data.content },
      select: { id: true, generatedContent: true },
    })
    return NextResponse.json({ data: { id: updated.id, content: updated.generatedContent } })
  } catch (error) {
    console.error('[cover-letter/[id]] PATCH', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const auth = await authorize(params.id)
    if (!auth.ok) return auth.response

    await prisma.coverLetter.delete({ where: { id: params.id } })
    return NextResponse.json({ data: { id: params.id } })
  } catch (error) {
    console.error('[cover-letter/[id]] DELETE', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
