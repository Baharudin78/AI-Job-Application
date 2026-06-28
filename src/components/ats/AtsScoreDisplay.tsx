'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import type { AtsResult } from '@/types'

import { cn } from '@/lib/utils'
import { KeywordBadge } from './KeywordBadge'

type Tab = 'missing' | 'matched' | 'suggestions'

function scoreColor(score: number): { stroke: string; text: string; label: string } {
  if (score <= 40) return { stroke: 'text-destructive', text: 'text-destructive', label: 'Needs work' }
  if (score <= 70) {
    return { stroke: 'text-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'Getting there' }
  }
  return { stroke: 'text-green-600', text: 'text-green-600 dark:text-green-400', label: 'Strong match' }
}

export function AtsScoreDisplay({ result, warning }: { result: AtsResult; warning?: string }) {
  const [tab, setTab] = useState<Tab>('missing')
  const color = scoreColor(result.score)

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - result.score / 100)

  return (
    <div className="space-y-5">
      {warning && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="relative size-32 shrink-0">
          <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="10"
              stroke="currentColor"
              className="text-muted"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="currentColor"
              className={color.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-3xl font-bold', color.text)}>{result.score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <p className={cn('text-sm font-semibold', color.text)}>{color.label}</p>
          <p className="text-sm text-muted-foreground">
            {result.summary || 'ATS match analysis complete.'}
          </p>
        </div>
      </div>

      <div className="inline-flex flex-wrap rounded-md border p-0.5">
        <TabButton active={tab === 'missing'} onClick={() => setTab('missing')}>
          Missing ({result.missingKeywords.length})
        </TabButton>
        <TabButton active={tab === 'matched'} onClick={() => setTab('matched')}>
          Matched ({result.matchedKeywords.length})
        </TabButton>
        <TabButton active={tab === 'suggestions'} onClick={() => setTab('suggestions')}>
          Suggestions ({result.suggestions.length})
        </TabButton>
      </div>

      {tab === 'missing' &&
        (result.missingKeywords.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Add these keywords to your CV where they truly apply:</p>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map((kw) => (
                <KeywordBadge key={kw} label={kw} variant="missing" />
              ))}
            </div>
          </div>
        ) : (
          <Empty>No important keywords are missing. Nice.</Empty>
        ))}

      {tab === 'matched' &&
        (result.matchedKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {result.matchedKeywords.map((kw) => (
              <KeywordBadge key={kw} label={kw} variant="matched" />
            ))}
          </div>
        ) : (
          <Empty>No matched keywords detected.</Empty>
        ))}

      {tab === 'suggestions' &&
        (result.suggestions.length > 0 ? (
          <ul className="space-y-3">
            {result.suggestions.map((s, i) => (
              <li key={`${s.category}-${i}`} className="rounded-md border p-3">
                {s.category && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.category}
                  </p>
                )}
                {s.issue && <p className="mt-0.5 text-sm">{s.issue}</p>}
                {s.fix && (
                  <p className="mt-1 text-sm text-green-700 dark:text-green-400">→ {s.fix}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No suggestions — your CV looks well aligned.</Empty>
        ))}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded px-3 py-1 text-sm font-medium transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-center text-sm text-muted-foreground">{children}</p>
}
