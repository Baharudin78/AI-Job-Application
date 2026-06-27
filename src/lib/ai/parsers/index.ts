import { UploadError } from '@/lib/utils/errors'
import { PDF_MIME, DOCX_MIME } from '@/lib/validations/file'
import { extractTextFromPdf } from './pdf-parser'
import { extractTextFromDocx } from './docx-parser'

/** Route a buffer to the right parser based on its (already-verified) MIME type. */
export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === PDF_MIME) return extractTextFromPdf(buffer)
  if (mimeType === DOCX_MIME) return extractTextFromDocx(buffer)
  throw new UploadError('Unsupported file type. Please upload a PDF or DOCX file.')
}

export { extractTextFromPdf, extractTextFromDocx }
