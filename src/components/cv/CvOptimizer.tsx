'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import type { DocumentStatus } from '@prisma/client'

import { useCvOptimize } from '@/hooks/useCvOptimize'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UpgradeBanner } from '@/components/shared/UpgradeBanner'
import { CvComparison } from './CvComparison'

export interface CvOptimizerDocument {
  id: string
  originalFileName: string
  status: DocumentStatus
  originalContent: string
  optimizedContent: string | null
  targetJobTitle: string | null
  targetIndustry: string | null
  errorMessage: string | null
}

const LONG_CV_CHARS = 20_000

export function CvOptimizer({ document }: { document: CvOptimizerDocument }) {
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState(document.targetJobTitle ?? '')
  const [industry, setIndustry] = useState(document.targetIndustry ?? '')
  const [confirmReopt, setConfirmReopt] = useState(false)
  const { state, error, errorCode, optimizedContent: freshOptimized, remaining, optimize } =
    useCvOptimize()

  const isLoading = state === 'loading'
  const isLong = document.originalContent.length > LONG_CV_CHARS
  const shownOptimized =
    freshOptimized ?? (document.status === 'DONE' ? document.optimizedContent : null)

  async function run(force: boolean): Promise<void> {
    setConfirmReopt(false)
    await optimize({
      documentId: document.id,
      targetJobTitle: jobTitle.trim() || undefined,
      targetIndustry: industry.trim() || undefined,
      force,
    })
  }

  // --- In progress -----------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <div>
          <p className="font-medium">AI is rewriting your CV…</p>
          <p className="text-sm text-muted-foreground">
            {isLong ? 'This is a long CV — it may take 30–60 seconds.' : 'This usually takes 10–30 seconds.'}
          </p>
        </div>
      </div>
    )
  }

  if (document.status === 'PROCESSING' && state === 'idle') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <div>
          <p className="font-medium">Optimization in progress…</p>
          <p className="text-sm text-muted-foreground">This keeps running even if you leave. Refresh to check.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>
    )
  }

  // --- Result (fresh or already optimized) -----------------------------------
  if (shownOptimized) {
    return (
      <div className="space-y-4">
        <CvComparison
          documentId={document.id}
          fileName={document.originalFileName}
          original={document.originalContent}
          optimized={shownOptimized}
        />

        <div className="flex items-center gap-2">
          {confirmReopt ? (
            <>
              <span className="text-sm text-muted-foreground">Replace the current version?</span>
              <Button size="sm" onClick={() => run(true)}>
                Yes, re-optimize
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmReopt(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setConfirmReopt(true)}>
              <RefreshCw className="size-4" />
              Re-optimize
            </Button>
          )}
        </div>

        {errorCode === 'usage_limit' ? (
          <UpgradeBanner remaining={remaining ?? 0} description={error ?? undefined} />
        ) : error && errorCode !== 'already_optimized' ? (
          <ErrorRow message={error} onRetry={() => run(true)} />
        ) : null}
      </div>
    )
  }

  // --- Form (UPLOADED or FAILED) ---------------------------------------------
  return (
    <div className="space-y-4">
      {document.status === 'FAILED' && (
        <ErrorRow
          message={document.errorMessage ?? 'The last optimization failed.'}
          onRetry={() => run(false)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="jobTitle">
            Target job title <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Frontend Engineer"
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="industry">
            Target industry <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Fintech"
            maxLength={100}
          />
        </div>
      </div>

      {isLong && (
        <p className="text-xs text-muted-foreground">
          This is a long CV — optimization may take 30–60 seconds.
        </p>
      )}

      {errorCode === 'usage_limit' ? (
        <UpgradeBanner remaining={remaining ?? 0} description={error ?? undefined} />
      ) : error ? (
        <ErrorRow message={error} onRetry={() => run(false)} />
      ) : null}

      <Button onClick={() => run(false)}>Optimize CV</Button>
    </div>
  )
}

function ErrorRow({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
