export interface AtsCheckPromptParams {
  cvContent: string
  jobDescription: string
}

export function buildAtsCheckPrompt(params: AtsCheckPromptParams): {
  system: string
  user: string
} {
  const system = `You are an ATS (Applicant Tracking System) analyst. Compare a CV against a job description and predict how well the CV passes an automated ATS keyword screen.

What matters for an ATS score:
- Hard-skill keywords (tools, technologies, programming languages, certifications) matter most.
- An exact or near-exact job-title match is very important.
- Required years-of-experience wording and certification names matter.
- Action verbs in bullet points help; soft skills matter least.

Return ONLY a JSON object with EXACTLY this shape:
{
  "score": <integer 0-100>,
  "matched_keywords": [<important job-description keywords found in the CV>],
  "missing_keywords": [<important job-description keywords missing from the CV>],
  "suggestions": [
    { "category": <short label, e.g. "Keywords">, "issue": <what is weak>, "fix": <a concrete fix> }
  ],
  "summary": <1-2 plain sentences summarizing the match>
}

RULES
- Output raw JSON only. No markdown, no code fences, no text before or after the JSON.
- "score" must be an integer between 0 and 100. Keep each array to at most 25 items.
- Only use keywords that actually appear in the job description; never invent requirements.
- If the job description is vague/generic, still return a score but say so in "summary".`

  const user = `--- CV ---
${params.cvContent}
--- END CV ---

--- JOB DESCRIPTION ---
${params.jobDescription}
--- END JOB DESCRIPTION ---

Return only the JSON object.`

  return { system, user }
}
