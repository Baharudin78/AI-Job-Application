import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function initialsFrom(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
    return (first + second).toUpperCase() || '?'
  }
  if (email && email.length > 0) return email[0].toUpperCase()
  return '?'
}

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  className?: string
}

/**
 * Avatar that shows the user's image, falling back to their initials when the
 * image is missing or fails to load (Radix Avatar handles the load failure).
 */
export function UserAvatar({ name, email, avatarUrl, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name ?? email ?? 'User'} /> : null}
      <AvatarFallback>{initialsFrom(name, email)}</AvatarFallback>
    </Avatar>
  )
}
