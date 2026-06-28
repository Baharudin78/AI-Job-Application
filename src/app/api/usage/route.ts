import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth/server'
import { getUsageStats, serializeUsageStats } from '@/lib/db/usage'

export const runtime = 'nodejs'
// Reads the auth cookie — must never be statically prerendered.
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stats = await getUsageStats(user.id)
    return NextResponse.json({ data: serializeUsageStats(stats) })
  } catch (error) {
    console.error('[usage]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
