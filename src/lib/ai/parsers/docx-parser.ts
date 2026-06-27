import mammoth from 'mammoth'
import { UploadError } from '@/lib/utils/errors'
import { normalizeWhitespace } from '@/lib/utils/text'

/**
 * Extract plain text from a DOCX buffer. Throws UploadError for invalid or
 * corrupt files (including non-Office ZIPs that slip past the magic-byte check).
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  let value: string
  try {
    const result = await mammoth.extractRawText({ buffer })
    value = result.value
  } catch {
    throw new UploadError(
      'We could not read this Word document. Please make sure it is a valid .docx file.',
    )
  }
  return normalizeWhitespace(value ?? '')
}
