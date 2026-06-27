export interface CvOptimizePromptParams {
  originalCv: string
  targetJobTitle?: string
  targetIndustry?: string
  /** The user's native language — a hint for the kinds of phrasing to clean up. */
  userLanguage: string
}

export function buildCvOptimizePrompt(params: CvOptimizePromptParams): {
  system: string
  user: string
} {
  const system = `You are a senior career consultant who rewrites CVs into clear, professional English for non-native English speakers.

Rewrite the CV below in polished, natural, professional English. Preserve its meaning and structure exactly.

STRICT RULES
- Preserve ALL facts: dates, company names, job titles, locations, numbers, and real achievements. Never invent experience, employers, skills, certifications, or metrics that are not in the original.
- Improve grammar, clarity, and tone. Use strong action verbs (led, built, increased, reduced). Only quantify an achievement if the number is already present or clearly implied.
- Keep the same sections and ordering as the original (e.g. Summary, Experience, Education, Skills). Keep the length similar — do not pad.
- Fix "translated-sounding" phrasing into idiomatic professional English.
- Output PLAIN TEXT only: no Markdown, no code fences, no commentary, no preamble. Use UPPERCASE section headings and "- " bullets.

OUTPUT SHAPE (structure only — follow the original's actual content)
PROFESSIONAL SUMMARY
<2-3 concise sentences>

EXPERIENCE
<Job Title> — <Company> (<dates>)
- <achievement>
- <achievement>

EDUCATION
<Degree> — <Institution> (<dates>)

SKILLS
<comma-separated list>`

  const context: string[] = []
  if (params.targetJobTitle) context.push(`Target job title: ${params.targetJobTitle}`)
  if (params.targetIndustry) context.push(`Target industry: ${params.targetIndustry}`)
  context.push(`Candidate's native language: ${params.userLanguage}`)

  const user = `${context.join('\n')}

Tailor wording toward the target role where the original content supports it, without inventing anything.

--- ORIGINAL CV ---
${params.originalCv}
--- END ORIGINAL CV ---

Return only the rewritten CV in professional English.`

  return { system, user }
}
