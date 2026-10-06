import { saveAs } from 'file-saver'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { canOpenInBrowser, mimeFromExtension, openDocumentsInTabs, type DocumentTabsResult } from '@/composables/documentTabs'

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
    const { t } = useI18n()
    const { warningAlert, errorAlert } = useAlert()

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

    /**
     * Opens documents in tabs of their own, saving the formats a browser cannot
     * show. Call it straight from the click handler, without awaiting anything
     * first, or the browser blocks the tabs as pop-ups.
     */
    async function openInTabs<T>(documents: T[], load: (document: T) => Promise<Blob | null | undefined>): Promise<DocumentTabsResult> {
        const result = await openDocumentsInTabs(documents, {
            load,
            fileName: (document) => documentFileName(document),
            save: (blob, fileName) => saveAs(blob, fileName),
            waitingText: t('documentTabs.waiting'),
        })

        if (result.blocked) {
            warningAlert(t('documentTabs.blockedTitle'), t('documentTabs.blocked', { count: result.blocked }, result.blocked))
        }
        if (result.failed) {
            errorAlert(t('documentTabs.failedTitle'), t('documentTabs.failed', { count: result.failed }, result.failed))
        }

        return result
    }

    return {
        canOpenInBrowser,
        openBlobInNewTab,
        openOrSaveOriginal,
        openInTabs,
    }
}
