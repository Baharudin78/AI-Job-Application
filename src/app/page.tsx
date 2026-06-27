import Link from "next/link"

/**
 * Public landing page (placeholder).
 * The real marketing page + pricing comes in a later session; this exists so
 * the foundation boots and has a clear entry point to auth.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          MVP — Foundation
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          AI Job Application Coach
        </h1>
        <p className="text-lg text-muted-foreground">
          Turn your CV into professional English, generate tailored cover letters, and
          beat the ATS — built for non-native English speakers.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/signup"
          className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="inline-flex h-10 items-center rounded-md border px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          Log in
        </Link>
      </div>
    </main>
  )
}
