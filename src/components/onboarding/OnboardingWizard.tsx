'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, Mail, ScanSearch } from 'lucide-react'

import { SUPPORTED_LANGUAGES } from '@/lib/validations/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/cv/FileUpload'
import { StepIndicator } from './StepIndicator'

interface Defaults {
  jobTitle: string
  industry: string
  language: string
}

const TOTAL = 3

const TITLES: Record<number, (name: string | null) => string> = {
  1: (name) => `Welcome${name ? `, ${name}` : ''}!`,
  2: () => 'Add your CV',
  3: () => "You're all set 🎉",
}

const DESCRIPTIONS: Record<number, string> = {
  1: "Tell us what you're aiming for so we can tailor your results.",
  2: 'Upload your CV now, or skip and do it later.',
  3: "Here's what you can do with AI Job Coach.",
}

export function OnboardingWizard({
  firstName,
  defaults,
}: {
  firstName: string | null
  defaults: Defaults
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [jobTitle, setJobTitle] = useState(defaults.jobTitle)
  const [industry, setIndustry] = useState(defaults.industry)
  const [language, setLanguage] = useState(defaults.language)
  const [busy, setBusy] = useState(false)

  async function persist(payload: Record<string, unknown>): Promise<boolean> {
    setBusy(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch {
      return false
    } finally {
      setBusy(false)
    }
  }

  async function saveStep1AndNext(): Promise<void> {
    await persist({
      targetJobTitle: jobTitle.trim() || undefined,
      targetIndustry: industry.trim() || undefined,
      language,
    })
    setStep(2)
  }

  async function complete(): Promise<void> {
    const ok = await persist({ complete: true })
    if (ok) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <StepIndicator current={step} total={TOTAL} />
        <CardTitle className="pt-2 text-2xl">{TITLES[step](firstName)}</CardTitle>
        <CardDescription>{DESCRIPTIONS[step]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">Target job title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Target industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Fintech"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="language">Preferred language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <FileUpload />
            <p className="text-xs text-muted-foreground">
              Optional — you can always upload later from the CV Optimizer.
            </p>
          </div>
        )}

        {step === 3 && (
          <ul className="space-y-3">
            <Feature icon={FileText} title="Optimize your CV" desc="Rewrite it in professional English." />
            <Feature icon={Mail} title="Generate cover letters" desc="Tailored to any job, in 3 tones." />
            <Feature icon={ScanSearch} title="Beat the ATS" desc="Score your CV against a job description." />
          </ul>
        )}

        <div className="flex items-center justify-between pt-2">
          <div>
            {step > 1 && step < 3 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} disabled={busy}>
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step < 3 && (
              <Button variant="ghost" size="sm" onClick={complete} disabled={busy}>
                Skip for now
              </Button>
            )}
            {step === 1 && (
              <Button onClick={saveStep1AndNext} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Continue
              </Button>
            )}
            {step === 2 && (
              <Button onClick={() => setStep(3)} disabled={busy}>
                Continue
              </Button>
            )}
            {step === 3 && (
              <Button onClick={complete} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Go to dashboard
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof FileText
  title: string
  desc: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </li>
  )
}
