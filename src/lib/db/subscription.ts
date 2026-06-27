import type { Prisma, Subscription } from '@prisma/client'
import { prisma } from './client'

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({ where: { userId } })
}

/**
 * Create the default FREE subscription for a new user. Called right after the
 * User record is created during signup (Session 0.3).
 */
export async function createFreeSubscription(userId: string): Promise<Subscription> {
  return prisma.subscription.create({
    data: { userId, tier: 'FREE', status: 'ACTIVE' },
  })
}

export async function updateSubscription(
  userId: string,
  data: Prisma.SubscriptionUpdateInput,
): Promise<Subscription> {
  return prisma.subscription.update({ where: { userId }, data })
}

/**
 * Idempotent upsert keyed by the Paddle subscription id — used by the Paddle
 * webhook handler (Session 2.1) where a User may not yet have a Subscription row.
 */
export async function upsertSubscriptionByUser(
  userId: string,
  data: Prisma.SubscriptionUncheckedCreateInput,
): Promise<Subscription> {
  const { userId: _ignored, ...rest } = data
  return prisma.subscription.upsert({
    where: { userId },
    update: rest,
    create: { ...rest, userId },
  })
}
