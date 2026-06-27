'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import type { SubscriptionTier } from '@prisma/client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { useLogout } from '@/hooks/useLogout'
import { DASHBOARD_NAV } from './dashboard-nav'

interface SidebarUser {
  name: string | null
  email: string
  avatarUrl: string | null
}

interface DashboardSidebarProps {
  user: SidebarUser
  tier: SubscriptionTier
  /** Called when a nav link is clicked — used to close the mobile sheet. */
  onNavigate?: () => void
}

export function DashboardSidebar({ user, tier, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { logout, loading } = useLogout()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="font-semibold tracking-tight" onClick={onNavigate}>
          AI Job Coach
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {DASHBOARD_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-1 py-2">
          <UserAvatar
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            className="size-9"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
            <Badge variant={tier === 'FREE' ? 'secondary' : 'default'} className="mt-0.5">
              {tier}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full justify-start text-muted-foreground"
          onClick={logout}
          disabled={loading}
        >
          <LogOut className="size-4" />
          {loading ? 'Logging out…' : 'Log out'}
        </Button>
      </div>
    </div>
  )
}
