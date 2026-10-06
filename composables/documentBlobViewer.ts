import { saveAs } from 'file-saver'

// Types a browser tab renders faithfully from the original bytes. HTML and SVG
// are left out on purpose: a blob: URL runs with this app's origin, so opening
// an uploaded page or SVG in a tab would run its scripts next to the session.
const BROWSER_VIEWABLE_MIME = /^(application\/pdf|image\/(png|jpe?g|gif|webp|bmp)|text\/plain|audio\/|video\/)/i

const BROWSER_VIEWABLE_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'txt', 'mp3', 'wav', 'mp4', 'webm']

// What the in-app viewer can draw, by extension. HTML and SVG are left out for
// the same reason as above. Anything not listed gets a "no preview" message.
export type DocumentPreviewKind = 'pdf' | 'image' | 'text' | 'docx' | 'none'

const PREVIEW_KINDS: Record<string, DocumentPreviewKind> = {
    pdf: 'pdf',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    bmp: 'image',
    txt: 'text',
    csv: 'text',
    docx: 'docx',
}

const PREVIEW_KIND_MIME = /^(application\/pdf|image\/(png|jpe?g|gif|webp|bmp)|text\/(plain|csv))$/i
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export function documentExtension(document: any): string {
    // A OneDrive row's file_url is its webUrl (".../Doc.aspx?sourcedoc=..."),
    // which says nothing about the format; its name does.
    const source = String((document?.is_onedrive ? document?.name : document?.file_url) || document?.name || '')
    const path = source.split('?')[0].split('#')[0]
    const lastSegment = path.split('/').pop() || ''

    return lastSegment.includes('.') ? (lastSegment.split('.').pop() || '').toLowerCase() : ''
}

// Company files are listed without their extension, so saving under the bare
// name gave a file the operating system could not open ("blank"). Add the
// stored file's extension back when the name does not already carry it.
export function documentFileName(document: any, fallback = 'dokument'): string {
    const name = String(document?.name || '').trim() || fallback
    const extension = documentExtension(document)

    if (!extension || name.toLowerCase().endsWith('.' + extension)) {
        return name
    }

    return `${name}.${extension}`
}

/**
 * How the in-app viewer shows a document. The extension decides; the blob's
 * type is only asked when the document has no extension at all, so a file
 * named .pdf is never drawn as something else because of what the server said.
 */
export function documentPreviewKind(document: any, blob?: Blob | null): DocumentPreviewKind {
    const extension = documentExtension(document)
    if (extension) {
        return PREVIEW_KINDS[extension] ?? 'none'
    }

    const type = (blob?.type || '').split(';')[0].trim().toLowerCase()
    if (type === DOCX_MIME) {
        return 'docx'
    }
    if (!PREVIEW_KIND_MIME.test(type)) {
        return 'none'
    }

    return type === 'application/pdf' ? 'pdf' : type.startsWith('image/') ? 'image' : 'text'
}

// The original bytes retyped for the kind they are shown as, whatever type the
// server sent, so an iframe or img can only ever treat them as that kind.
export function blobForPreview(blob: Blob, document: any, kind: DocumentPreviewKind): Blob {
    const type = kind === 'pdf'
        ? 'application/pdf'
        : kind === 'image'
            ? (MIME_BY_EXTENSION[documentExtension(document)] ?? blob.type)
            : 'text/plain'

    return blob.type === type ? blob : new Blob([blob], { type })
}

export function canPreviewInApp(document: any): boolean {
    return documentPreviewKind(document) !== 'none'
}

// Opens an already-downloaded document Blob in a new browser tab instead of
// saving it to disk (file-saver's saveAs). The object URL is revoked after a
// short delay so the tab has time to load it before the memory is freed.
export function documentBlobViewer() {
    function canOpenInBrowser(blob: Blob, fileName = ''): boolean {
        if (blob?.type && BROWSER_VIEWABLE_MIME.test(blob.type)) {
            return true
        }

        // An empty or generic type says nothing either way; fall back to the name.
        const genericType = !blob?.type || blob.type === 'application/octet-stream'
        const extension = fileName.includes('.') ? (fileName.split('.').pop() || '').toLowerCase() : ''

        return genericType && BROWSER_VIEWABLE_EXTENSIONS.includes(extension)
    }

    function openBlobInNewTab(blob: Blob): boolean {
        const url = URL.createObjectURL(blob)
        const opened = window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
        return !!opened
    }

    /**
     * Shows the original file. A browser can only display some formats itself;
     * handing it a Word or Excel file as a blob: tab made it save a nameless
     * file with no extension that then looked blank. Those are saved under
     * their real name and extension instead, untouched, so they open in the
     * program that made them.
     *
     * Returns 'opened' when a tab showed it, 'saved' when it was downloaded.
     * A user without the download_documents permission passes allowSave
     * false: a file no tab can show is then left alone and 'blocked' comes
     * back, so the caller can say why nothing opened.
     */
    function openOrSaveOriginal(blob: Blob, fileName: string, allowSave = true): 'opened' | 'saved' | 'blocked' {
        if (canOpenInBrowser(blob, fileName)) {
            const typed = blob.type && blob.type !== 'application/octet-stream'
                ? blob
                : new Blob([blob], { type: mimeFromExtension(fileName) })
            if (openBlobInNewTab(typed)) {
                return 'opened'
            }
        }

        if (!allowSave) {
            return 'blocked'
        }

        saveAs(blob, fileName)

        return 'saved'
    }

    return {
        canOpenInBrowser,
        openBlobInNewTab,
        openOrSaveOriginal,
    }
}

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

function mimeFromExtension(fileName: string): string {
    const extension = fileName.includes('.') ? (fileName.split('.').pop() || '').toLowerCase() : ''

    return MIME_BY_EXTENSION[extension] || 'application/octet-stream'
}
