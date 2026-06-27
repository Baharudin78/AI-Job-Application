import {
  LayoutDashboard,
  FileText,
  Mail,
  ScanSearch,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const DASHBOARD_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'CV Optimizer', href: '/cv', icon: FileText },
  { label: 'Cover Letter', href: '/cover-letter', icon: Mail },
  { label: 'ATS Checker', href: '/ats', icon: ScanSearch },
  { label: 'Settings', href: '/settings', icon: Settings },
]
