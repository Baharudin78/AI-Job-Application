import { z } from 'zod'

export const COVER_LETTER_TONES = ['PROFESSIONAL', 'FRIENDLY', 'CONCISE'] as const
export type CoverLetterToneValue = (typeof COVER_LETTER_TONES)[number]

export const MIN_JOB_DESCRIPTION = 50
export const MAX_JOB_DESCRIPTION = 5000

export const coverLetterSchema = z.object({
  jobTitle: z.string().trim().min(2, 'Job title is too short').max(100, 'Job title is too long'),
  companyName: z.string().trim().max(100, 'Company name is too long').optional(),
  jobDescription: z
    .string()
    .trim()
    .min(MIN_JOB_DESCRIPTION, `Please paste at least ${MIN_JOB_DESCRIPTION} characters`)
    .max(MAX_JOB_DESCRIPTION, `Job description is too long (max ${MAX_JOB_DESCRIPTION})`),
  tone: z.enum(COVER_LETTER_TONES),
  // Accepts any string (incl. "" from the <select>). The route validates that
  // it is a real uuid before using it, treating anything else as "no CV".
  cvDocumentId: z.string().optional(),
})

export type CoverLetterInput = z.infer<typeof coverLetterSchema>

export const TONE_LABELS: Record<CoverLetterToneValue, { label: string; description: string }> = {
  PROFESSIONAL: { label: 'Professional', description: 'Formal and polished' },
  FRIENDLY: { label: 'Friendly', description: 'Warm but professional' },
  CONCISE: { label: 'Concise', description: 'Short and direct' },
}
