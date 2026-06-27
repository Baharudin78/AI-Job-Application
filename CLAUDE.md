# AI Job Application Coach — Project Rules

## What We're Building
A SaaS that helps non-English speaking professionals (Indonesia, Philippines, India, LATAM) write
professional English CVs and cover letters using Claude AI. Users upload their CV → we rewrite it
in professional English → generate ATS-optimized cover letters → analyze job descriptions.

Target: Solo developer build. Prioritize correctness and maintainability over cleverness.

---

## Tech Stack (use exact versions, do not upgrade without asking)

```
Next.js 14 (App Router, NOT Pages Router)
TypeScript 5.x (strict mode ALWAYS on)
Tailwind CSS 3.x
shadcn/ui (new-york style)
Supabase (PostgreSQL + Auth + Storage)
Prisma 5.x (ORM — never write raw SQL unless absolutely necessary)
@anthropic-ai/sdk (Claude API)
Paddle Billing (payments — Merchant of Record)
Zustand 4.x (client state only)
Zod 3.x (ALL input validation — no exceptions)
Resend (transactional email)
react-pdf (PDF export)
```

---

## Folder Structure (follow exactly, do not deviate)

```
/src
  /app
    /api                  # API routes (Route Handlers)
      /ai                 # AI feature endpoints
      /webhooks           # External webhooks (Paddle)
      /auth               # Auth helpers
    /(auth)               # Auth page group
      /login
      /signup
      /verify
    /(dashboard)          # Protected page group
      /dashboard          # Main dashboard
      /cv                 # CV optimizer
      /cover-letter       # Cover letter generator
      /ats                # ATS checker
      /interview          # Interview practice
      /settings           # Profile + billing
    /layout.tsx
    /page.tsx             # Landing page (public)
  /components
    /ui                   # shadcn base components (do not modify)
    /cv                   # CV-specific components
    /cover-letter         # Cover letter components
    /ats                  # ATS components
    /shared               # Shared across features
    /layouts              # Layout components
  /lib
    /ai                   # Claude API service layer
    /db                   # Prisma client + DB utilities
    /auth                 # Supabase auth helpers
    /payments             # Paddle utilities
    /validations          # Zod schemas (one file per domain)
    /utils                # Pure utility functions
  /hooks                  # Custom React hooks (useFoo naming)
  /types                  # TypeScript types and interfaces
  /middleware.ts           # Supabase auth middleware
```

---

## Architecture Principles

### Server vs Client Components
- Default to Server Components unless you need interactivity or browser APIs
- Add `'use client'` only when: useState, useEffect, onClick, browser APIs are needed
- Never fetch data inside client components directly — use server components or API routes
- Data mutations always go through API routes, never direct DB calls from client

### Data Fetching
- Server Components: use Prisma directly
- Client Components: fetch from `/api/` routes
- Never import Prisma in client components (it will expose DB credentials)

### API Route Pattern
Every API route must follow this structure:
```typescript
// /src/app/api/cv/optimize/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/server'
import { checkUsageLimit } from '@/lib/db/usage'
import { validateSubscription } from '@/lib/payments/subscription'

const schema = z.object({
  // Always define schema first
})

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Validate input
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    // 3. Check subscription & usage limits
    const canUse = await checkUsageLimit(user.id, 'cv_optimize')
    if (!canUse.allowed) return NextResponse.json({ error: canUse.reason }, { status: 403 })

    // 4. Business logic

    // 5. Track usage
    await trackUsage(user.id, 'cv_optimize')

    // 6. Return response
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[cv/optimize]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Coding Standards

### TypeScript
- `strict: true` in tsconfig.json — no exceptions
- No `any` type. Use `unknown` and narrow it properly
- Always type function return values explicitly for public functions
- Use `interface` for objects, `type` for unions and primitives
- Export types from `/src/types/` so they can be shared

### Error Handling
- Every async function must have try/catch
- API routes return `{ error: string }` on failure, `{ data: T }` on success
- Never expose raw error messages to the client (might leak internals)
- Log errors with context: `console.error('[feature/action]', error)`
- Use custom error classes for domain errors (see /src/lib/utils/errors.ts)

### Validation (Zod)
- Define Zod schema BEFORE writing handler logic
- Every API route input must be validated
- Every form must have client-side Zod validation (react-hook-form + zodResolver)
- File uploads: validate type AND size before processing

### Database (Prisma)
- Never use `findFirst` when you expect a unique result — use `findUnique`
- Always handle `null` from Prisma queries explicitly
- Use transactions for operations that modify multiple tables
- Never hardcode IDs or values that belong in environment variables
- Add database indexes for columns used in WHERE clauses

### Security
- Never trust client-provided user IDs. Always get user from auth session server-side
- Validate file MIME type server-side, not just extension
- Max file size: 10MB for CV uploads
- Rate limit all AI endpoints: 10 req/min per user
- Sanitize all content before displaying (use DOMPurify for HTML)
- Never log sensitive data (CV content, email body, tokens)

### AI (Claude API)
- All Claude prompts live in `/src/lib/ai/prompts/` as constants
- Never construct prompts inline in route handlers
- Always set `max_tokens` explicitly — never rely on defaults
- Handle `overloaded_error` from Claude with exponential backoff (max 3 retries)
- User content must be sanitized before sending to Claude
- Claude responses must be validated before storing to DB

---

## Database Schema Rules
- All tables have `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
- All tables have `created_at timestamptz DEFAULT now()`
- Foreign keys always have ON DELETE CASCADE or ON DELETE SET NULL — never leave orphans
- Usage limits are per billing month (format: "YYYY-MM"), NOT calendar month

---

## Environment Variables
All env vars must be in `.env.local.example` with descriptions. Never hardcode.
- `NEXT_PUBLIC_` prefix: safe for client, still should be non-sensitive
- No `NEXT_PUBLIC_` prefix: server-only, can be secrets

---

## Testing Checklist (run through this before marking a feature "done")
- [ ] Happy path works correctly
- [ ] Empty state: no data yet — what does the user see?
- [ ] Error state: API fails — user sees clear error message, not blank screen
- [ ] Loading state: spinner or skeleton while data loads
- [ ] Input validation: edge cases (empty string, too long, invalid format)
- [ ] File upload: wrong type, too large, empty file, corrupted file
- [ ] Mobile: works on 375px viewport
- [ ] Auth: unauthenticated user redirected to login
- [ ] Subscription gate: free user trying pro feature sees upgrade prompt
- [ ] Usage limit: user at limit sees clear message with how to upgrade

---

## What To Never Do
- DO NOT use `any` in TypeScript
- DO NOT call Prisma from client components
- DO NOT trust client-provided user IDs
- DO NOT store API keys or secrets in code
- DO NOT use `useEffect` for data fetching — use server components or SWR
- DO NOT write raw SQL unless Prisma can't do it and add comment explaining why
- DO NOT skip error handling "to do it later" — add it now
- DO NOT create a feature without its loading and error states
- DO NOT use `console.log` in production code — use `console.error` for real errors only
- DO NOT add new npm packages without checking if an existing one already covers it
- DO NOT skip input validation for "internal" endpoints — they can still be called by attackers

---

## Feature Flags
Track which features are complete in `/src/lib/features.ts`:
```typescript
export const FEATURES = {
  CV_OPTIMIZER: true,
  COVER_LETTER: true,
  ATS_CHECKER: false,     // not built yet
  INTERVIEW_PRACTICE: false,
} as const
```

---

## Commit Convention
```
feat: add CV optimizer endpoint
fix: handle empty PDF parse result
chore: add usage tracking to cover letter
test: add validation tests for file upload
```

One logical change per commit. Do not mix unrelated changes.
