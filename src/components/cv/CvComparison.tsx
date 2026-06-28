'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Download, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CvComparisonProps {
  documentId: string
  fileName: string
  original: string
  optimized: string
}

type Tab = 'optimized' | 'original'

export function CvComparison({ documentId, fileName, original, optimized }: CvComparisonProps) {
  const [tab, setTab] = useState<Tab>('optimized')
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(optimized)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked (insecure context) — ignore silently.
    }
  }

  function download() {
    const blob = new Blob([optimized], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const base = fileName.replace(/\.[^.]+$/, '') || 'cv'
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${base}-optimized.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border p-0.5">
          <TabButton active={tab === 'optimized'} onClick={() => setTab('optimized')}>
            Optimized
          </TabButton>
          <TabButton active={tab === 'original'} onClick={() => setTab('original')}>
            Original
          </TabButton>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="size-4" />
            Download
          </Button>
          <Button asChild size="sm">
            <Link href={`/cover-letter/new?cv=${documentId}`}>
              <Mail className="size-4" />
              Cover letter
            </Link>
          </Button>
        </div>
      </div>

      <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-4 font-sans text-sm leading-relaxed">
        {tab === 'optimized' ? optimized : original}
      </pre>
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
