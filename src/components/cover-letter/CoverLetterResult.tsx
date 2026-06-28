'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Download, Pencil, RefreshCw, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CoverLetterResultProps {
  coverLetterId: string
  content: string
  fileBaseName?: string
  onRegenerate?: () => void
  regenerating?: boolean
  showDelete?: boolean
}

export function CoverLetterResult({
  coverLetterId,
  content,
  fileBaseName = 'cover-letter',
  onRegenerate,
  regenerating,
  showDelete,
}: CoverLetterResultProps) {
  const router = useRouter()
  const [current, setCurrent] = useState(content)
  const [draft, setDraft] = useState(content)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-sync when the parent swaps in newly generated content (regenerate).
  useEffect(() => {
    setCurrent(content)
    setDraft(content)
    setEditing(false)
  }, [content, coverLetterId])

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(current)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be blocked — ignore.
    }
  }

  function download(): void {
    const blob = new Blob([current], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${fileBaseName}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function save(): Promise<void> {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/cover-letter/${coverLetterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      })
      const json = (await res.json()) as { data?: { content: string }; error?: string }
      if (!res.ok || !json.data) {
        setError(json.error ?? 'Could not save your changes.')
        return
      }
      setCurrent(json.data.content)
      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(): Promise<void> {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/cover-letter/${coverLetterId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        setError(json.error ?? 'Could not delete this cover letter.')
        setDeleting(false)
        return
      }
      router.push('/cover-letter')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
            <RefreshCw className="size-4" />
            Regenerate
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="outline" size="sm" onClick={download}>
          <Download className="size-4" />
          Download
        </Button>
        {editing ? (
          <>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(current)
                setEditing(false)
              }}
            >
              <X className="size-4" />
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-h-[24rem] font-sans text-sm leading-relaxed"
        />
      ) : (
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-4 font-sans text-sm leading-relaxed">
          {current}
        </pre>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showDelete && (
        <div className="flex items-center gap-2 border-t pt-3">
          {confirmDelete ? (
            <>
              <span className="text-sm text-muted-foreground">Delete this cover letter?</span>
              <Button variant="destructive" size="sm" onClick={remove} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
