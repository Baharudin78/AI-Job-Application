/**
 * Normalize extracted document text: unify line breaks, collapse runs of
 * spaces/tabs, trim each line, and cap consecutive blank lines.
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Remove HTML tags from pasted content (e.g. a job description copied from a site). */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ')
}
