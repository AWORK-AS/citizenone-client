/**
 * An initials avatar for someone without a photo, built in the browser.
 *
 * It replaces https://ui-avatars.com/api/?name=..., which the app called in
 * some 75 places: every citizen list, schedule and mailbox sent the full name
 * of each citizen, employee or correspondent on screen to a third-party
 * service abroad, one request per face. A health-and-care journal has no
 * business doing that, and it also meant no avatar at all offline.
 *
 * The result is an SVG data URI, so it drops into the same `<img :src>` the
 * old URL sat in; the CSP already allows `data:` images.
 */

// Brand tint with brand ink: the same pairing the mobile app uses for its
// initials fallback. Replaces the old #42AED9 fill, which failed contrast
// with its white letters.
const BACKGROUND = '#E1EFF3'
const INK = '#0F4C75'

export function avatarInitials(name: unknown): string {
    let text = String(name ?? '').trim()
    // A bare address: the mailbox part is the person ("jens.jensen@..." -> JJ).
    if (/^\S+@\S+$/.test(text)) text = text.split('@')[0]

    const words = text
        // A name built as "undefined undefined" or "null" by string concatenation
        // upstream is no name.
        .replace(/\b(undefined|null)\b/g, ' ')
        .replace(/[+_.@]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((word) => /\p{L}|\p{N}/u.test(word))
    if (words.length === 0) return '?'

    const first = Array.from(words[0])[0]
    const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : ''

    return (first + last).toLocaleUpperCase('da-DK')
}

function escapeXml(text: string): string {
    return text.replace(/[<>&'"]/g, (character) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
    }[character] as string))
}

export function avatarUrl(name: unknown): string {
    const initials = escapeXml(avatarInitials(name))
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`
        + `<rect width="64" height="64" fill="${BACKGROUND}"/>`
        + `<text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="${INK}" `
        + `font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="600">${initials}</text>`
        + `</svg>`

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
