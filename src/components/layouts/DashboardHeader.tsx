'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, Settings as SettingsIcon } from 'lucide-react'
import type { SubscriptionTier } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { useLogout } from '@/hooks/useLogout'
import { DashboardSidebar } from './DashboardSidebar'
import { DASHBOARD_NAV } from './dashboard-nav'

interface HeaderUser {
  name: string | null
  email: string
  avatarUrl: string | null
}

interface DashboardHeaderProps {
  user: HeaderUser
  tier: SubscriptionTier
}

export function DashboardHeader({ user, tier }: DashboardHeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useLogout()

  const current = DASHBOARD_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <DashboardSidebar user={user} tier={tier} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm lg:flex">
          <span className="text-muted-foreground">Dashboard</span>
          {current && current.href !== '/dashboard' && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{current.label}</span>
            </>
          )}
        </nav>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open user menu"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <UserAvatar
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
              className="size-8"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="truncate text-sm font-medium">{user.name ?? 'Account'}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <SettingsIcon className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
