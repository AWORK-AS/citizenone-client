/**
 * The embeddable player URL for a video link, or null.
 *
 * Only the hosts the backend accepts are translated, and anything else
 * returns null rather than being framed as-is: this value becomes an iframe
 * src, so an unrecognised URL must never reach it.
 */
export function useVideoEmbed() {
    function videoEmbedUrl(url?: string | null): string | null {
        if (!url) return null

        let parsed: URL
        try {
            parsed = new URL(url)
        } catch (_) {
            return null
        }

        const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

        if (host === 'youtube.com') {
            const id = parsed.searchParams.get('v')
            return id ? `https://www.youtube.com/embed/${id}` : null
        }

        if (host === 'youtu.be') {
            const id = parsed.pathname.replace(/^\//, '')
            return id ? `https://www.youtube.com/embed/${id}` : null
        }

        if (host === 'vimeo.com') {
            const id = parsed.pathname.split('/').filter(Boolean)[0]
            return id ? `https://player.vimeo.com/video/${id}` : null
        }

        if (host === 'player.vimeo.com') {
            return parsed.toString()
        }

        if (host === 'loom.com') {
            // Loom shares as /share/<id> and embeds as /embed/<id>.
            const id = parsed.pathname.split('/').filter(Boolean).pop()
            return id ? `https://www.loom.com/embed/${id}` : null
        }

        return null
    }

    return { videoEmbedUrl }
}
