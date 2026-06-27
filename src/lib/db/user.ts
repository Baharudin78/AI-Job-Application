import type { Prisma, User } from '@prisma/client'
import { prisma } from './client'

export interface CreateUserInput {
  /** Supabase auth.users id — must come from the verified session, never the client body. */
  id: string
  email: string
  name?: string | null
  avatarUrl?: string | null
  /** UI language preference (ISO code). Defaults to "en" via the schema. */
  language?: string
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      id: input.id,
      email: input.email,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
      ...(input.language ? { language: input.language } : {}),
    },
  })
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } })
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { id }, data })
}

/**
 * Ensure an app User row (and its FREE Subscription) exists for a verified
 * Supabase auth user. Idempotent — safe to call on every authenticated access.
 *
 * Uses two sequential upserts rather than an interactive transaction so it
 * behaves well over the Supabase transaction pooler (PgBouncer); both upserts
 * are individually idempotent, so a retry converges to the same state.
 */
export async function ensureUserProvisioned(input: CreateUserInput): Promise<User> {
  const user = await prisma.user.upsert({
    where: { id: input.id },
    update: { email: input.email },
    create: {
      id: input.id,
      email: input.email,
      name: input.name ?? null,
      ...(input.language ? { language: input.language } : {}),
    },
  })

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, tier: 'FREE', status: 'ACTIVE' },
  })

  return user
}
