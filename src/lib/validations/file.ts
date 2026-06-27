export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MIN_TEXT_LENGTH = 100 // warn the user below this
export const SCANNED_TEXT_THRESHOLD = 50 // below this it's likely an image-only scan

export const PDF_MIME = 'application/pdf'
export const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const ALLOWED_MIME_TYPES = [PDF_MIME, DOCX_MIME] as const
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'] as const

export type DetectedKind = 'pdf' | 'docx'

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : ''
}

/**
 * Validate file metadata (size + extension). Cheap; runs on client and server.
 * NOTE: `file.type` is spoofable — the authoritative content check is
 * `detectFileType()` against the raw bytes (server-side only).
 */
export function validateFile(input: {
  name: string
  size: number
  type?: string
}): FileValidationResult {
  if (input.size <= 0) return { valid: false, error: 'This file is empty.' }
  if (input.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File is too large. The maximum size is 10MB.' }
  }
  const ext = getExtension(input.name)
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return { valid: false, error: 'Unsupported file type. Please upload a PDF or DOCX file.' }
  }
  return { valid: true }
}

/**
 * Detect the real file type from magic bytes (not the declared MIME/extension).
 * - PDF: starts with "%PDF-"
 * - DOCX: a ZIP container → starts with the local-file-header signature PK\x03\x04
 *   (also accept the empty/spanned ZIP signatures defensively).
 */
export function detectFileType(buffer: Buffer): DetectedKind | null {
  if (buffer.length >= 5 && buffer.toString('latin1', 0, 5) === '%PDF-') {
    return 'pdf'
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 && // P
    buffer[1] === 0x4b && // K
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
  ) {
    return 'docx'
  }
  return null
}

export function kindToMime(kind: DetectedKind): string {
  return kind === 'pdf' ? PDF_MIME : DOCX_MIME
}

export function kindToExtension(kind: DetectedKind): string {
  return kind === 'pdf' ? '.pdf' : '.docx'
}

/** Strip control characters / path separators and clamp length for safe display. */
export function sanitizeFileName(name: string): string {
  let out = ''
  for (const ch of name) {
    const code = ch.codePointAt(0) ?? 0
    if (code < 0x20 || code === 0x7f) continue
    out += ch === '/' || ch === '\\' ? '_' : ch
  }
  out = out.trim()
  return (out || 'document').slice(0, 200)
}
