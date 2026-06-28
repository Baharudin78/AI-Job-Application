'use client'

import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** e.g. "CV optimizations" — used to personalize the message. */
  featureLabel?: string
}

const PRO_BENEFITS = [
  'Unlimited CV optimizations',
  'Unlimited cover letters',
  'Unlimited ATS checks',
  'Professional PDF export',
]

export function UpgradeModal({ open, onOpenChange, featureLabel }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 sm:mx-0">
            <Sparkles className="size-5 text-primary" />
          </span>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            {featureLabel
              ? `You've reached your ${featureLabel.toLowerCase()} limit for this month.`
              : "You've reached your plan limit for this month."}{' '}
            Go unlimited with Pro.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {PRO_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm">
              <Check className="size-4 shrink-0 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button asChild>
            <Link href="/settings/billing">See plans</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
