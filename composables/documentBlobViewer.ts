import { saveAs } from 'file-saver'

// Types a browser tab renders faithfully from the original bytes. HTML and SVG
// are left out on purpose: a blob: URL runs with this app's origin, so opening
// an uploaded page or SVG in a tab would run its scripts next to the session.
const BROWSER_VIEWABLE_MIME = /^(application\/pdf|image\/(png|jpe?g|gif|webp|bmp)|text\/plain|audio\/|video\/)/i

const BROWSER_VIEWABLE_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'txt', 'mp3', 'wav', 'mp4', 'webm']

// Word files the in-app viewer (docx-preview) can lay out from the original.
const IN_APP_PREVIEW_EXTENSIONS = ['docx']

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

export function canPreviewInApp(document: any): boolean {
    return IN_APP_PREVIEW_EXTENSIONS.includes(documentExtension(document))
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

function mimeFromExtension(fileName: string): string {
    const extension = fileName.includes('.') ? (fileName.split('.').pop() || '').toLowerCase() : ''
    const types: Record<string, string> = {
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

    return types[extension] || 'application/octet-stream'
}
