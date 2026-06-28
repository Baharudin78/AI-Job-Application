'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, ScanSearch } from 'lucide-react'
import type { AtsResult } from '@/types'

import { atsCheckSchema, MAX_ATS_JD } from '@/lib/validations/ats'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UpgradeModal } from '@/components/shared/UpgradeModal'
import { cn } from '@/lib/utils'
import { AtsScoreDisplay } from './AtsScoreDisplay'

export interface CvOption {
  id: string
  label: string
}

type State = 'idle' | 'loading' | 'success' | 'error'
type AtsResponse = AtsResult & { warning?: string }

export function AtsForm({ cvOptions }: { cvOptions: CvOption[] }) {
  const [cvId, setCvId] = useState('')
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [result, setResult] = useState<AtsResponse | null>(null)

  const usingSavedCv = cvId !== ''
  const isLoading = state === 'loading'
  const jdTooLong = jobDescription.length > MAX_ATS_JD

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)

    const payload: { jobDescription: string; cvDocumentId?: string; cvContent?: string } = {
      jobDescription,
    }
    if (usingSavedCv) payload.cvDocumentId = cvId
    else if (cvText.trim()) payload.cvContent = cvText

    const parsed = atsCheckSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your input.')
      setState('error')
      return
    }

    setState('loading')
    try {
      const res = await fetch('/api/ats/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const json = (await res.json()) as { data?: AtsResponse; error?: string; code?: string }
      if (!res.ok || !json.data) {
        if (json.code === 'usage_limit') setModalOpen(true)
        setError(json.error ?? 'Analysis failed. Please try again.')
        setState('error')
        return
      }
      setResult(json.data)
      setState('success')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setState('error')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4">
        {cvOptions.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="cvId">Use a saved CV</Label>
            <select
              id="cvId"
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Paste CV text instead…</option>
              {cvOptions.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {!usingSavedCv && (
          <div className="space-y-1.5">
            <Label htmlFor="cvText">CV text</Label>
            <Textarea
              id="cvText"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text here…"
              className="min-h-[10rem]"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="jobDescription">Job description</Label>
            <span className={cn('text-xs', jdTooLong ? 'text-destructive' : 'text-muted-foreground')}>
              {jobDescription.length}/{MAX_ATS_JD}
            </span>
          </div>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here…"
            className="min-h-[10rem]"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Analyze ATS match
        </Button>
      </form>

      <div>
        {isLoading ? (
          <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-3 rounded-lg border text-center">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Scoring your CV against the job…</p>
          </div>
        ) : result ? (
          <div className="rounded-lg border bg-card p-4">
            <AtsScoreDisplay result={result} warning={result.warning} />
          </div>
        ) : (
          <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
            <ScanSearch className="size-7" />
            <p className="text-sm">Your ATS score will appear here.</p>
          </div>
        )}
      </div>

      <UpgradeModal open={modalOpen} onOpenChange={setModalOpen} featureLabel="ATS checks" />
    </div>
  )
}
