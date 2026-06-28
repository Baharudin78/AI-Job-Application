'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'

import {
  coverLetterSchema,
  type CoverLetterInput,
  COVER_LETTER_TONES,
  TONE_LABELS,
  MAX_JOB_DESCRIPTION,
} from '@/lib/validations/cover-letter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UpgradeBanner } from '@/components/shared/UpgradeBanner'
import { cn } from '@/lib/utils'
import { CoverLetterResult } from './CoverLetterResult'

export interface CvOption {
  id: string
  label: string
}

interface CoverLetterFormProps {
  cvOptions: CvOption[]
  initialCvId?: string
}

interface GenResult {
  id: string
  content: string
}

export function CoverLetterForm({ cvOptions, initialCvId }: CoverLetterFormProps) {
  const [result, setResult] = useState<GenResult | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)

  const form = useForm<CoverLetterInput>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      jobTitle: '',
      companyName: '',
      jobDescription: '',
      tone: 'PROFESSIONAL',
      cvDocumentId: initialCvId ?? '',
    },
  })

  const tone = form.watch('tone')
  const jobDescription = form.watch('jobDescription') ?? ''
  const isSubmitting = form.formState.isSubmitting
  const errors = form.formState.errors

  async function onSubmit(values: CoverLetterInput): Promise<void> {
    setFormError(null)
    setErrorCode(null)
    try {
      const res = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = (await res.json()) as {
        data?: GenResult
        error?: string
        code?: string
        remaining?: number
      }
      if (!res.ok || !json.data) {
        setErrorCode(json.code ?? null)
        setRemaining(typeof json.remaining === 'number' ? json.remaining : null)
        setFormError(json.error ?? 'Generation failed. Please try again.')
        return
      }
      setResult({ id: json.data.id, content: json.data.content })
    } catch {
      setFormError('Network error. Please check your connection and try again.')
    }
  }

  const jdTooLong = jobDescription.length > MAX_JOB_DESCRIPTION

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input id="jobTitle" placeholder="e.g. Frontend Engineer" {...form.register('jobTitle')} />
            {errors.jobTitle && <p className="text-sm text-destructive">{errors.jobTitle.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyName">
              Company <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input id="companyName" placeholder="e.g. Acme Inc." {...form.register('companyName')} />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            )}
          </div>
        </div>

        {cvOptions.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="cvDocumentId">
              Base it on a CV <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <select
              id="cvDocumentId"
              {...form.register('cvDocumentId')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">No CV — use the job description only</option>
              {cvOptions.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Tone</Label>
          <div className="grid grid-cols-3 gap-2">
            {COVER_LETTER_TONES.map((t) => {
              const meta = TONE_LABELS[t]
              const active = tone === t
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => form.setValue('tone', t, { shouldValidate: true })}
                  className={cn(
                    'rounded-md border p-2.5 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/40',
                  )}
                  aria-pressed={active}
                >
                  <span className="block text-sm font-medium">{meta.label}</span>
                  <span className="block text-xs text-muted-foreground">{meta.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="jobDescription">Job description</Label>
            <span
              className={cn('text-xs', jdTooLong ? 'text-destructive' : 'text-muted-foreground')}
            >
              {jobDescription.length}/{MAX_JOB_DESCRIPTION}
            </span>
          </div>
          <Textarea
            id="jobDescription"
            placeholder="Paste the full job description here…"
            className="min-h-[12rem]"
            {...form.register('jobDescription')}
          />
          {errors.jobDescription && (
            <p className="text-sm text-destructive">{errors.jobDescription.message}</p>
          )}
        </div>

        {errorCode === 'usage_limit' ? (
          <UpgradeBanner remaining={remaining ?? 0} description={formError ?? undefined} />
        ) : formError ? (
          <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Generate cover letter
        </Button>
      </form>

      <div>
        {isSubmitting ? (
          <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-3 rounded-lg border text-center">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Writing your cover letter…</p>
          </div>
        ) : result ? (
          <CoverLetterResult
            coverLetterId={result.id}
            content={result.content}
            onRegenerate={form.handleSubmit(onSubmit)}
            regenerating={isSubmitting}
          />
        ) : (
          <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center text-muted-foreground">
            <Mail className="size-7" />
            <p className="text-sm">Your cover letter will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
