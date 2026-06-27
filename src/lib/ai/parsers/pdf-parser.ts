import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { UploadError } from '@/lib/utils/errors'
import { normalizeWhitespace } from '@/lib/utils/text'

/**
 * Extract plain text from a PDF buffer.
 *
 * Throws UploadError for unreadable PDFs (password-protected or corrupt).
 * Image-only/scanned PDFs parse successfully but return very little text — the
 * caller is responsible for warning the user about that.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  let result: { text: string }
  try {
    result = await pdfParse(buffer)
  } catch {
    throw new UploadError(
      'We could not read this PDF. It may be password-protected or corrupted — please upload an unlocked PDF.',
    )
  }
  return normalizeWhitespace(result.text ?? '')
}
