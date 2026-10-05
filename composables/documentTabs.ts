// Opening documents in browser tabs, one or many at a time.
//
// A browser lets a page open a tab only as the direct result of a click. The
// lists used to download each file first and open its tab afterwards, so every
// tab after the first - and the first too, when the download was slow - was
// opened outside the click and blocked as a pop-up. The file was then saved to
// disk instead, which is what "Åbn valgte" looked like to the customer.
//
// So the tabs are taken while the click is still being handled, before any
// download starts, and each is pointed at its file once that has arrived.
// Kept free of Vue and of file-saver so it runs under node --test.

// Types a browser tab renders faithfully from the original bytes. HTML and SVG
// are left out on purpose: a blob: URL runs with this app's origin, so opening
// an uploaded page or SVG in a tab would run its scripts next to the session.
const BROWSER_VIEWABLE_MIME = /^(application\/pdf|image\/(png|jpe?g|gif|webp|bmp)|text\/plain|audio\/|video\/)/i

const BROWSER_VIEWABLE_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'txt', 'mp3', 'wav', 'mp4', 'webm']

const MIME_BY_EXTENSION: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    txt: 'text/plain',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
}

// How long a tab is given to load its file before the object URL is freed.
const REVOKE_AFTER_MS = 60_000

function extensionOf(fileName: string): string {
    return fileName.includes('.') ? (fileName.split('.').pop() || '').toLowerCase() : ''
}

export function mimeFromExtension(fileName: string): string {
    return MIME_BY_EXTENSION[extensionOf(fileName)] || 'application/octet-stream'
}

export function canOpenInBrowser(blob: Blob, fileName = ''): boolean {
    if (blob?.type && BROWSER_VIEWABLE_MIME.test(blob.type)) {
        return true
    }

    // An empty or generic type says nothing either way; fall back to the name.
    const genericType = !blob?.type || blob.type === 'application/octet-stream'

    return genericType && BROWSER_VIEWABLE_EXTENSIONS.includes(extensionOf(fileName))
}

/**
 * Whether a file is worth a tab before its bytes are known. A name with a Word
 * or Excel extension will be saved, so no tab is taken for it; a name without
 * an extension might still turn out to be a PDF, so it gets one.
 */
export function mayOpenInBrowser(fileName: string): boolean {
    const extension = extensionOf(fileName)

    return !extension || BROWSER_VIEWABLE_EXTENSIONS.includes(extension)
}

export interface DocumentTabsOptions<T> {
    load: (document: T) => Promise<Blob | null | undefined>
    fileName: (document: T) => string
    save: (blob: Blob, fileName: string) => void
    // Shown in a tab while its file downloads.
    waitingText?: string
    openWindow?: (url: string, target: string) => Window | null
    createObjectURL?: (blob: Blob) => string
    revokeObjectURL?: (url: string) => void
    schedule?: (callback: () => void, ms: number) => unknown
}

export interface DocumentTabsResult {
    opened: number
    saved: number
    // Viewable files whose tab the browser refused. Nothing was downloaded for
    // these: the person is asked to allow pop-ups and try again.
    blocked: number
    failed: number
}

function showWaiting(tab: Window, text: string) {
    try {
        tab.document.title = text
        tab.document.body.textContent = text
    } catch {
        // A tab that is not ours to write in still works as a target.
    }
}

/**
 * Opens each document in its own tab, or saves it when a browser cannot show
 * that format. Must be called straight from the click handler: everything up
 * to the first download runs inside the click, which is what lets the tabs
 * open at all.
 */
export async function openDocumentsInTabs<T>(documents: T[], options: DocumentTabsOptions<T>): Promise<DocumentTabsResult> {
    const openWindow = options.openWindow ?? ((url, target) => window.open(url, target))
    const createObjectURL = options.createObjectURL ?? ((blob) => URL.createObjectURL(blob))
    const revokeObjectURL = options.revokeObjectURL ?? ((url) => URL.revokeObjectURL(url))
    const schedule = options.schedule ?? ((callback, ms) => setTimeout(callback, ms))

    // Taken synchronously, before the first await.
    const tabs = documents.map((document) => {
        if (!mayOpenInBrowser(options.fileName(document))) {
            return undefined
        }
        const tab = openWindow('', '_blank')
        if (tab && options.waitingText) {
            showWaiting(tab, options.waitingText)
        }

        return tab
    })

    const result: DocumentTabsResult = { opened: 0, saved: 0, blocked: 0, failed: 0 }

    for (const [index, document] of documents.entries()) {
        const tab = tabs[index]
        const name = options.fileName(document)

        let blob: Blob | null | undefined
        try {
            blob = await options.load(document)
        } catch {
            blob = null
        }

        if (!blob) {
            tab?.close()
            result.failed++
            continue
        }

        if (!canOpenInBrowser(blob, name)) {
            tab?.close()
            options.save(blob, name)
            result.saved++
            continue
        }

        // No tab was asked for: the name promised a format a browser cannot
        // show, but the bytes say otherwise. Saving keeps it reachable.
        if (tab === undefined) {
            options.save(blob, name)
            result.saved++
            continue
        }

        if (!tab || tab.closed) {
            result.blocked++
            continue
        }

        const typed = blob.type && blob.type !== 'application/octet-stream'
            ? blob
            : new Blob([blob], { type: mimeFromExtension(name) })
        const url = createObjectURL(typed)
        tab.location.href = url
        schedule(() => revokeObjectURL(url), REVOKE_AFTER_MS)
        result.opened++
    }

    return result
}
