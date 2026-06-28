import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  FileText,
  Globe,
  Mail,
  ScanSearch,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'AI Job Application Coach — Professional English CVs & cover letters',
  description:
    'Turn your CV into professional English, generate tailored cover letters, and beat the ATS. Built for non-native English speakers in Indonesia, the Philippines, India and LATAM.',
}

const FEATURES = [
  {
    icon: FileText,
    title: 'AI CV Optimizer',
    desc: 'Upload your CV and get it rewritten in clear, professional English — your facts preserved, your wording elevated.',
  },
  {
    icon: Mail,
    title: 'Cover Letter Generator',
    desc: 'Paste a job description and get a tailored cover letter in seconds, in a professional, friendly, or concise tone.',
  },
  {
    icon: ScanSearch,
    title: 'ATS Score Checker',
    desc: 'See how well your CV matches a job before you apply, with the exact keywords you’re missing.',
  },
]

const STEPS = [
  { icon: Upload, title: 'Upload your CV', desc: 'PDF or DOCX — we extract the text instantly.' },
  { icon: Wand2, title: 'AI rewrites it', desc: 'Polished professional English, tailored to your target role.' },
  { icon: ScanSearch, title: 'Apply with confidence', desc: 'Cover letters and ATS checks ready in one place.' },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    features: ['3 CV optimizations / mo', '3 cover letters / mo', '5 ATS checks / mo', 'Basic PDF export'],
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    popular: true,
    features: ['Unlimited CV optimizations', 'Unlimited cover letters', 'Unlimited ATS checks', 'Professional PDF export'],
  },
  {
    name: 'Career Booster',
    price: '$24',
    period: '/mo',
    features: ['Everything in Pro', 'Interview practice', 'LinkedIn optimizer', 'AI career coach'],
  },
]

const STATS = [
  { value: '1B+', label: 'Non-native English speakers worldwide' },
  { value: '80%', label: 'Of the global workforce is L2 English' },
  { value: '$4', label: 'Starting price in emerging markets' },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-5 text-primary" />
            AI Job Coach
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/[0.04] to-transparent" />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Globe className="size-3.5" />
              Built for non-native English speakers
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Land the job in{' '}
              <span className="text-primary">professional English</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Turn your CV into polished English, generate tailored cover letters, and beat the ATS —
              powered by AI, priced for everyone.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free plan included</p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 py-10 text-center sm:grid-cols-3 sm:px-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to apply abroad</h2>
            <p className="mt-3 text-muted-foreground">
              Three AI tools that turn a rough draft into a competitive application.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="rounded-xl border bg-card p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
              <p className="mt-3 text-muted-foreground">From rough CV to ready-to-send in three steps.</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="text-center">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-full border bg-background">
                      <Icon className="size-5 text-primary" />
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-1 font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Simple, fair pricing</h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Upgrade when you&apos;re ready. Regional pricing in emerging markets.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'flex flex-col rounded-xl border bg-card p-6',
                  plan.popular && 'border-primary shadow-sm',
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.popular && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="mt-3">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full" variant={plan.popular ? 'default' : 'outline'}>
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-brand-gradient">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center text-white sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight">Your next job speaks English. Now so do you.</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/80">
              Join professionals across Southeast Asia, India and LATAM applying abroad with confidence.
            </p>
            <Button asChild size="lg" className="mt-8 bg-white text-primary hover:bg-white/90">
              <Link href="/signup">
                Get started free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Sparkles className="size-4 text-primary" />
            AI Job Coach
          </div>
          <p>© {new Date().getFullYear()} AI Job Application Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
