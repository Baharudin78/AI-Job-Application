export interface AtsCheckPromptParams {
  cvContent: string
  jobDescription: string
}

export function buildAtsCheckPrompt(params: AtsCheckPromptParams): {
  system: string
  user: string
} {
  const system = `You are an ATS (Applicant Tracking System) analyst. Compare a CV against a job description and score how well the CV would pass an ATS keyword screen.

How to score (0-100):
- Hard-skill keywords (tools, technologies, certifications) matter most.
- An exact job-title match and required years-of-experience wording matter a lot.
- Soft skills matter least.

Return ONLY a JSON object with EXACTLY this shape and nothing else:
{
  "score": <integer 0-100>,
  "matched": [<important keywords from the job description that appear in the CV>],
  "missing": [<important keywords from the job description missing from the CV>],
  "suggestions": [<short, actionable improvements to raise the ATS score>]
}

OUTPUT RULES
- Output raw JSON only. No Markdown, no code fences, no comments, no text before or after the JSON.
- Use plain strings in the arrays. Keep each array to at most 25 items.
- "score" must be an integer between 0 and 100.`

  const user = `--- CV ---
${params.cvContent}
--- END CV ---

--- JOB DESCRIPTION ---
${params.jobDescription}
--- END JOB DESCRIPTION ---

Return only the JSON object.`

  return { system, user }
}
