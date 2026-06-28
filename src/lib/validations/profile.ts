import { z } from 'zod'

/** UI-language options (codes stored on User.language). Targets our key markets. */
export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'tl', label: 'Filipino' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'vi', label: 'Tiếng Việt' },
] as const

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long'),
  language: z.enum(['en', 'id', 'tl', 'hi', 'es', 'pt', 'vi']),
})

export type ProfileInput = z.infer<typeof profileSchema>
