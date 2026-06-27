import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

import { getCurrentUser, createSupabaseAdminClient } from '@/lib/auth/server'
import { prisma } from '@/lib/db/client'
import { rateLimit } from '@/lib/utils/rate-limit'
import { UploadError } from '@/lib/utils/errors'
import { extractTextFromFile } from '@/lib/ai/parsers'
import {
  validateFile,
  detectFileType,
  getExtension,
  kindToMime,
  kindToExtension,
  sanitizeFileName,
  MIN_TEXT_LENGTH,
  SCANNED_TEXT_THRESHOLD,
} from '@/lib/validations/file'

export const runtime = 'nodejs'
export const maxDuration = 60

const BUCKET = 'cv-documents'
const UPLOAD_LIMIT = 5
const UPLOAD_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Authenticate
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Rate limit (5 uploads / hour / user) — keyed by trusted session id
    const limit = rateLimit(`cv-upload:${user.id}`, UPLOAD_LIMIT, UPLOAD_WINDOW_MS)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again in a little while.' },
        { status: 429 },
      )
    }

    // 3. Parse multipart form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Invalid upload. Expected a multipart form.' },
        { status: 400 },
      )
    }
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 })
    }

    // 4a. Validate metadata (size + extension)
    const meta = validateFile({ name: file.name, size: file.size, type: file.type })
    if (!meta.valid) {
      return NextResponse.json({ error: meta.error }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'This file is empty.' }, { status: 400 })
    }

    // 4b. Validate the actual content via magic bytes (file.type is spoofable)
    const kind = detectFileType(buffer)
    if (!kind) {
      return NextResponse.json(
        { error: 'This file does not look like a real PDF or DOCX. Please upload a valid file.' },
        { status: 400 },
      )
    }
    const ext = getExtension(file.name)
    if (kindToExtension(kind) !== ext) {
      return NextResponse.json(
        {
          error: `This file's content is ${kind.toUpperCase()} but its name ends in "${ext}". Please rename or re-export it.`,
        },
        { status: 400 },
      )
    }

    // 5. Extract text
    let text: string
    try {
      text = await extractTextFromFile(buffer, kindToMime(kind))
    } catch (error) {
      if (error instanceof UploadError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }

    const charCount = text.length
    let warning: string | undefined
    if (charCount < SCANNED_TEXT_THRESHOLD) {
      warning =
        'We could barely read any text — this looks like a scanned/image PDF. Upload a text-based CV for best results.'
    } else if (charCount < MIN_TEXT_LENGTH) {
      warning = 'We extracted very little text. Double-check this is the right document.'
    }

    // 6. Upload the original file to private storage
    const admin = createSupabaseAdminClient()
    const storagePath = `${user.id}/${randomUUID()}${kindToExtension(kind)}`
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: kindToMime(kind), upsert: false })
    if (uploadError) {
      console.error('[cv/upload] storage', uploadError.message)
      return NextResponse.json(
        { error: 'Could not save your file. Please try again.' },
        { status: 500 },
      )
    }

    // 7. Create the CvDocument record; roll back storage on failure
    let document: { id: string; originalFileName: string }
    try {
      document = await prisma.cvDocument.create({
        data: {
          userId: user.id,
          originalFileName: sanitizeFileName(file.name),
          fileStoragePath: storagePath,
          originalContent: text,
          status: 'UPLOADED',
        },
        select: { id: true, originalFileName: true },
      })
    } catch (dbError) {
      console.error('[cv/upload] db', dbError)
      await admin.storage
        .from(BUCKET)
        .remove([storagePath])
        .catch(() => undefined)
      return NextResponse.json(
        { error: 'Could not save your CV. Please try again.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      data: {
        id: document.id,
        fileName: document.originalFileName,
        extractedText: text,
        charCount,
        warning,
      },
    })
  } catch (error) {
    console.error('[cv/upload]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
