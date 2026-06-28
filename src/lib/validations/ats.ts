import { z } from 'zod'

export const MAX_ATS_CV = 10000
export const MAX_ATS_JD = 5000
export const ATS_SHORT_THRESHOLD = 100

export const atsCheckSchema = z
  .object({
    cvContent: z.string().trim().max(MAX_ATS_CV, 'CV text is too long').optional(),
    cvDocumentId: z.string().uuid().optional(),
    jobDescription: z
      .string()
      .trim()
      .min(1, 'Paste a job description')
      .max(MAX_ATS_JD, 'Job description is too long'),
  })
  .refine((d) => (d.cvContent && d.cvContent.length > 0) || !!d.cvDocumentId, {
    message: 'Paste your CV text or choose a saved CV',
    path: ['cvContent'],
  })

export type AtsCheckInput = z.infer<typeof atsCheckSchema>
