/**
 * Domain error classes.
 *
 * This is expanded into a full hierarchy (AppError + subclasses) in Session 4.1.
 * For now we only need UploadError so the file-upload flow can throw typed,
 * user-safe messages.
 */
export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}
