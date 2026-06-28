import { getCurrentUser } from '@/lib/auth/server'
import { updateUser } from '@/lib/db/user'
import { success, error } from '@/lib/utils/api-response'
import { AuthError, ValidationError } from '@/lib/utils/errors'
import { profileSchema } from '@/lib/validations/profile'

export const runtime = 'nodejs'

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new AuthError()

    const body = await request.json().catch(() => null)
    const parsed = profileSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Some details are invalid.')
    }

    const updated = await updateUser(user.id, {
      name: parsed.data.name,
      language: parsed.data.language,
    })

    return success({ name: updated.name, language: updated.language })
  } catch (err) {
    console.error('[api/user] PATCH', err)
    return error(err)
  }
}
