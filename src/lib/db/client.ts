import { PrismaClient } from '@prisma/client'

/**
 * Singleton Prisma client.
 *
 * In Next.js dev, module hot-reload would otherwise spin up a new client on
 * every change and exhaust DB connections. We cache one instance on globalThis.
 * Logging is limited to errors/warnings so query params (which may contain PII)
 * are never written to logs (CLAUDE.md: never log sensitive data).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
