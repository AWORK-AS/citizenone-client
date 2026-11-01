/**
 * Small pure helpers for CitizenOne Online Meetings, kept here so they can be
 * tested without a browser (tests/unit/meetingsUtils.test.mjs).
 */

/** "1.4 MB", "820 KB", "12 B" - for files shared in the meeting chat. */
export function formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * The name a citizen's document is sent under. Documents are often named
 * without an extension ("Handleplan"); the stored file has one, and the
 * receiver's computer needs it to open the file.
 */
export function sharedFileName(name: string | null | undefined, fileUrl: string | null | undefined): string {
    const base = (name ?? '').trim() || 'file'
    if (/\.[a-z0-9]{1,5}$/i.test(base)) return base
    const ext = String(fileUrl ?? '').split(/[?#]/)[0].split('/').pop()?.split('.').slice(1).pop() ?? ''
    return /^[a-z0-9]{1,5}$/i.test(ext) ? `${base}.${ext}` : base
}

/** Up to two initials, for an avatar without a picture. */
export function initials(name: string | null | undefined): string {
    return (name || '?').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'
}
