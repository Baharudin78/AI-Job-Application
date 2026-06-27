export type CoverLetterTone = 'PROFESSIONAL' | 'FRIENDLY' | 'CONCISE'

export interface CoverLetterPromptParams {
  jobTitle: string
  companyName?: string
  jobDescription: string
  /** A short summary of the candidate's CV/background. */
  cvSummary: string
  tone: CoverLetterTone
  userLanguage: string
}

const TONE_GUIDE: Record<CoverLetterTone, string> = {
  PROFESSIONAL: 'formal and polished, confident but not boastful',
  FRIENDLY: 'warm and personable while staying professional',
  CONCISE: 'tight and direct — short paragraphs, no filler',
}

export function buildCoverLetterPrompt(params: CoverLetterPromptParams): {
  system: string
  user: string
} {
  const system = `You are a career consultant who writes tailored, ATS-friendly cover letters in professional English for non-native English speakers.

Write a cover letter for the candidate and role described by the user.

STRICT RULES
- Ground every claim in the candidate's provided background. Never invent employers, titles, metrics, or skills that are not supported by it.
- Connect the candidate's real strengths to the job's actual requirements.
- 3 to 4 short paragraphs, roughly 220-340 words. No address block, no date, no placeholders like "[Your Name]".
- Natural, idiomatic professional English — never translated-sounding.
- Output PLAIN TEXT only: no Markdown, no code fences, no commentary or preamble. Start directly with the greeting (e.g. "Dear Hiring Manager,").`

  const user = `Tone: ${TONE_GUIDE[params.tone]}
Job title: ${params.jobTitle}
${params.companyName ? `Company: ${params.companyName}` : 'Company: (not specified — address generically)'}
Candidate's native language: ${params.userLanguage}

--- CANDIDATE BACKGROUND ---
${params.cvSummary}
--- END CANDIDATE BACKGROUND ---

--- JOB DESCRIPTION ---
${params.jobDescription}
--- END JOB DESCRIPTION ---

Return only the cover letter text.`

  return { system, user }
}
