/**
 * A readable name for a device from the User-Agent its login sent, for the
 * approved-devices list: "Chrome · macOS", "Safari · iOS", "CitizenOne desktop
 * · Windows". An Admin approving a waiting device needs to recognise it, and
 * the raw header (or the random device id) says nothing to them.
 *
 * The app sends its own readable user_agent ("CitizenOne app · iOS 18 ·
 * iPhone"), which is shown as it is. Unknown or empty gives '' (the page shows
 * a dash).
 */
export function deviceLabel(userAgent: unknown): string {
    const ua = String(userAgent ?? '').trim()
    if (!ua) return ''
    if (/^CitizenOne app\b/i.test(ua)) return ua

    const browser = browserOf(ua)
    const os = osOf(ua)

    return [browser, os].filter(Boolean).join(' · ')
}

function browserOf(ua: string): string {
    // Order matters: Edge, Opera and Electron all say "Chrome", and Chrome says "Safari".
    if (/Electron\//.test(ua)) return 'CitizenOne desktop'
    if (/Edg(e|A|iOS)?\//.test(ua)) return 'Edge'
    if (/OPR\/|Opera/.test(ua)) return 'Opera'
    if (/SamsungBrowser\//.test(ua)) return 'Samsung Internet'
    if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox'
    if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome'
    if (/Safari\//.test(ua)) return 'Safari'
    return ''
}

function osOf(ua: string): string {
    // iPads ask for the desktop site and say "Macintosh"; they still say "Mobile/".
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && /Mobile\//.test(ua))) return 'iOS'
    if (/Android/.test(ua)) return 'Android'
    if (/Windows/.test(ua)) return 'Windows'
    if (/Mac OS X|Macintosh/.test(ua)) return 'macOS'
    if (/CrOS/.test(ua)) return 'ChromeOS'
    if (/Linux/.test(ua)) return 'Linux'
    return ''
}
