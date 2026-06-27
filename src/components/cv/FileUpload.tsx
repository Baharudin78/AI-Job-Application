'use client'

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'

import { validateFile, ALLOWED_EXTENSIONS } from '@/lib/validations/file'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'selected' | 'uploading' | 'success' | 'error'

interface UploadResult {
  id: string
  fileName: string
  extractedText: string
  charCount: number
  warning?: string
}

const ACCEPT = ALLOWED_EXTENSIONS.join(',')

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragging, setDragging] = useState(false)

  const reset = useCallback(() => {
    setStatus('idle')
    setFile(null)
    setError(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const selectFile = useCallback((f: File) => {
    const check = validateFile({ name: f.name, size: f.size, type: f.type })
    if (!check.valid) {
      setError(check.error ?? 'Invalid file.')
      setStatus('error')
      setFile(null)
      return
    }
    setError(null)
    setResult(null)
    setFile(f)
    setStatus('selected')
  }, [])

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) selectFile(f)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    if (status === 'uploading') return
    const f = e.dataTransfer.files?.[0]
    if (f) selectFile(f)
  }

  async function upload() {
    if (!file) return
    setStatus('uploading')
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/cv/upload', { method: 'POST', body: formData })
      const json = (await res.json()) as { data?: UploadResult; error?: string }
      if (!res.ok || !json.data) {
        setError(json.error ?? 'Upload failed. Please try again.')
        setStatus('error')
        return
      }
      setResult(json.data)
      setStatus('success')
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'success' && result) {
    return (
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Uploaded successfully</p>
            <p className="truncate text-sm text-muted-foreground">
              {result.fileName} · {result.charCount.toLocaleString()} characters extracted
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Upload another
          </Button>
        </div>

        {result.warning && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{result.warning}</span>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Preview</p>
          <p className="line-clamp-4 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-muted-foreground">
            {result.extractedText.slice(0, 200)}
            {result.extractedText.length > 200 ? '…' : ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && status !== 'uploading') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (status !== 'uploading') setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-disabled={status === 'uploading'}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/40',
          status === 'uploading' && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={onInputChange}
          disabled={status === 'uploading'}
        />
        <UploadCloud className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drag &amp; drop your CV here, or <span className="text-primary">browse</span>
        </p>
        <p className="text-xs text-muted-foreground">PDF or DOCX · up to 10MB</p>
      </div>

      {file && (status === 'selected' || status === 'uploading') && (
        <div className="mt-3 flex items-center gap-3 rounded-md border p-3">
          <FileText className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          {status === 'uploading' ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Uploading…
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={upload}>
                Upload
              </Button>
              <Button size="icon" variant="ghost" onClick={reset} aria-label="Remove file">
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {error && status === 'error' && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
