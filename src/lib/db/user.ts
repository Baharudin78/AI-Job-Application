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
